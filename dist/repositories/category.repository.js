"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const category_model_1 = require("../models/category.model");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../shared/constants/constants");
let CategoryRepository = class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(category_model_1.CategoryModel);
    }
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne({
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            });
        });
    }
    findBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne({ slug: slug.toLowerCase() });
        });
    }
    toggleStatus(id, isActive, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findByIdAndUpdate(id, { $set: { isActive, status } }, { new: true });
        });
    }
    findAllCategory(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const searchMatch = {};
            if ((_a = filters.search) === null || _a === void 0 ? void 0 : _a.trim()) {
                searchMatch.name = { $regex: new RegExp(filters.search.trim(), 'i') };
            }
            let isActiveFilter = {};
            if (!(filters === null || filters === void 0 ? void 0 : filters.status)) {
                isActiveFilter.status = [constants_1.CATEGORY_STATUS.ACTIVE, constants_1.CATEGORY_STATUS.INACTIVE];
            }
            else {
                isActiveFilter.status = [filters.status];
            }
            const skip = (filters.page - 1) * filters.limit;
            const [result] = yield this.model.aggregate([
                { $match: searchMatch },
                {
                    $facet: {
                        // Branch 1: paginated list — only approved + dropdown filter
                        categories: [
                            {
                                $match: {
                                    status: { $in: [...isActiveFilter.status] },
                                },
                            },
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: filters.limit },
                        ],
                        // Branch 2: total for pagination — respects dropdown filter
                        totalCount: [
                            {
                                $match: {
                                    status: { $in: [...isActiveFilter.status] },
                                },
                            },
                            { $count: 'count' },
                        ],
                        // Branch 3: global stats — sees ALL statuses, unaffected by dropdown
                        stats: [
                            {
                                $group: {
                                    _id: null,
                                    total: {
                                        $sum: {
                                            $cond: [
                                                { $in: ['$status', [constants_1.CATEGORY_STATUS.ACTIVE, constants_1.CATEGORY_STATUS.INACTIVE]] },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    active: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ['$status', constants_1.CATEGORY_STATUS.ACTIVE] },
                                                        { $eq: ['$isActive', true] },
                                                    ],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    inactive: {
                                        $sum: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ['$status', constants_1.CATEGORY_STATUS.INACTIVE] },
                                                        { $eq: ['$isActive', false] },
                                                    ],
                                                },
                                                1,
                                                0,
                                            ],
                                        },
                                    },
                                    pendingApproval: {
                                        $sum: { $cond: [{ $eq: ['$status', constants_1.CATEGORY_STATUS.PENDING] }, 1, 0] },
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        categories: 1,
                        total: { $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0] },
                        stats: {
                            total: { $ifNull: [{ $arrayElemAt: ['$stats.total', 0] }, 0] },
                            active: { $ifNull: [{ $arrayElemAt: ['$stats.active', 0] }, 0] },
                            inactive: { $ifNull: [{ $arrayElemAt: ['$stats.inactive', 0] }, 0] },
                            pendingApproval: { $ifNull: [{ $arrayElemAt: ['$stats.pendingApproval', 0] }, 0] },
                        },
                    },
                },
            ]);
            return {
                categories: result.categories,
                total: result.total,
                stats: result.stats,
            };
        });
    }
    findPendingRequests(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                status: constants_1.CATEGORY_STATUS.PENDING,
            };
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                query.name = { $regex: new RegExp(search.trim(), 'i') };
            }
            const skip = (page - 1) * limit;
            const [requests, total] = yield Promise.all([
                this.model
                    .find(query)
                    .populate('requestedBy', 'name email') // vendor info
                    .sort({ createdAt: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                category_model_1.CategoryModel.countDocuments(query),
            ]);
            return { requests, total };
        });
    }
    reviewRequest(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {
                status: data.status,
                isActive: data.isActive,
                createdBy: new mongoose_1.default.Types.ObjectId(data.adminId), // admin who reviewed
            };
            if (data.status === constants_1.APPROVE_REJECT_ACTIONS.REJECT && data.rejectionReason) {
                updateData.rejectionReason = data.rejectionReason;
            }
            else {
                updateData.slug = data.slug;
            }
            return this.findByIdAndUpdate(id, { $set: updateData }, { new: true });
        });
    }
    findReviewedRequest(page, limit, search, selectedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                status: selectedFilter
                    ? selectedFilter
                    : { $in: [constants_1.CATEGORY_STATUS.REJECTED, constants_1.CATEGORY_STATUS.ACTIVE] },
                requestedBy: { $ne: null },
            };
            if (search === null || search === void 0 ? void 0 : search.trim()) {
                query.name = { $regex: new RegExp(search.trim(), 'i') };
            }
            const skip = (page - 1) * limit;
            const [requests, total] = yield Promise.all([
                this.model
                    .find(query)
                    .populate('requestedBy', 'name email')
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(query),
            ]);
            return { requests, total };
        });
    }
    findVendorCategory(vendorId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const query = {
                requestedBy: new mongoose_1.default.Types.ObjectId(vendorId),
                status: constants_1.CATEGORY_STATUS.PENDING,
            };
            if ((_a = filter.search) === null || _a === void 0 ? void 0 : _a.trim()) {
                query.name = { $regex: new RegExp(filter.search.trim(), 'i') };
            }
            if (filter.selectedFilter) {
                query.status = filter.selectedFilter;
            }
            const skip = (filter.page - 1) * filter.limit;
            const [data, total] = yield Promise.all([
                this.model
                    .find(query)
                    .sort({ updatedAt: -1 })
                    .skip(skip)
                    .limit(filter.limit)
                    .lean(),
                this.model.countDocuments(query),
            ]);
            return { data, total };
        });
    }
    findDuplicateRequest(vendorId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne({
                requestedBy: new mongoose_1.default.Types.ObjectId(vendorId),
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            });
        });
    }
    countPendingByVendor(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.countDocuments({
                requestedBy: new mongoose_1.default.Types.ObjectId(vendorId),
                status: constants_1.CATEGORY_STATUS.PENDING,
            });
        });
    }
    findActiveCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findAll({ status: constants_1.CATEGORY_STATUS.ACTIVE, isActive: true });
        });
    }
};
exports.CategoryRepository = CategoryRepository;
exports.CategoryRepository = CategoryRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CategoryRepository);
