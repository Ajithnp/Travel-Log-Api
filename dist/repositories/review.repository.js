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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const review_model_1 = require("../models/review.model");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
let ReviewRepository = class ReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(review_model_1.ReviewModel);
    }
    buildSortStage(sort) {
        switch (sort) {
            case 'latest':
                return { createdAt: -1 };
            case 'oldest':
                return { createdAt: 1 };
            case 'ratingHigh':
                return { rating: -1 };
            case 'ratingLow':
                return { rating: 1 };
            default:
                return { createdAt: -1 };
        }
    }
    findByPackageId(packageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.findOne({ packageId, userId });
        });
    }
    getRatingStats(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        packageId: (0, objectId_helper_1.toObjectId)(packageId),
                        isDeleted: false,
                    },
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$rating' },
                        total: { $sum: 1 },
                        count1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                        count2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        count3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        count4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        count5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    },
                },
            ]);
            if (!result[0]) {
                return { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
            }
            const data = result[0];
            return {
                average: Math.round(data.average * 10) / 10,
                total: data.total,
                breakdown: { 1: data.count1, 2: data.count2, 3: data.count3, 4: data.count4, 5: data.count5 },
            };
        });
    }
    getRatingStatsByVendorId(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                {
                    $match: {
                        vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                        isDeleted: false,
                    },
                },
                {
                    $group: {
                        _id: null,
                        average: { $avg: '$rating' },
                        total: { $sum: 1 },
                        count1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                        count2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                        count3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                        count4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                        count5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                    },
                },
            ]);
            if (!result[0]) {
                return { average: 0, total: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
            }
            const data = result[0];
            return {
                average: Math.round(data.average * 10) / 10,
                total: data.total,
                breakdown: { 1: data.count1, 2: data.count2, 3: data.count3, 4: data.count4, 5: data.count5 },
            };
        });
    }
    getAverageRating(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                { $match: { packageId: (0, objectId_helper_1.toObjectId)(packageId), isDeleted: false } },
                { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]);
            if (!result[0]) {
                return { average: 0, total: 0 };
            }
            const data = result[0];
            return { average: Math.round(data.avgRating), total: data.count };
        });
    }
    findAllByPackageId(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                packageId: (0, objectId_helper_1.toObjectId)(filters.packageId),
                isDeleted: false,
            };
            if (filters.userId) {
                query.userId = { $ne: filters.userId };
            }
            const skip = (filters.page - 1) * filters.limit;
            const [reviews, total] = yield Promise.all([
                this.model
                    .find(query)
                    .populate('userId', 'name')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(filters.limit)
                    .lean(),
                this.model.countDocuments(query),
            ]);
            return { reviews: reviews, total };
        });
    }
    findAllByVendorId(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = {
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                isDeleted: false,
            };
            if (filters.packageId) {
                query.packageId = (0, objectId_helper_1.toObjectId)(filters.packageId);
            }
            if (filters.rating) {
                query.rating = Number(filters.rating);
            }
            if (filters.search) {
                query.$text = { $search: filters.search };
            }
            const skip = (filters.page - 1) * filters.limit;
            const [reviews, total] = yield Promise.all([
                this.model
                    .find(query)
                    .populate('userId', 'name')
                    .populate('packageId', 'title')
                    .sort(this.buildSortStage(filters.sortBy))
                    .skip(skip)
                    .limit(filters.limit)
                    .lean(),
                this.model.countDocuments(query),
            ]);
            return { reviews: reviews, total };
        });
    }
};
exports.ReviewRepository = ReviewRepository;
exports.ReviewRepository = ReviewRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ReviewRepository);
