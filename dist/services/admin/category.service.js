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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.CategoryService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const slug_generator_helper_1 = require("../../shared/utils/slug.generator.helper");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const messages_1 = require("../../shared/constants/messages");
const constants_1 = require("../../shared/constants/constants");
const category_mapper_1 = require("../../shared/mappers/category.mapper");
let CategoryService = class CategoryService {
    constructor(_categoryRepository) {
        this._categoryRepository = _categoryRepository;
    }
    createCategory(adminId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminObjectId = (0, objectId_helper_1.toObjectId)(adminId);
            const existing = yield this._categoryRepository.findByName(data.name);
            if (existing) {
                throw new AppError_1.AppError(`A category named "${data.name}" already exists`, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            const slug = (0, slug_generator_helper_1.generateSlug)(data.name);
            yield this._categoryRepository.create(Object.assign(Object.assign({}, data), { slug, isActive: true, status: constants_1.CATEGORY_STATUS.ACTIVE, createdBy: adminObjectId }));
        });
    }
    updateCategory(adminId, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this._categoryRepository.findById(id);
            if (!category) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (category.status === constants_1.CATEGORY_STATUS.PENDING ||
                category.status === constants_1.CATEGORY_STATUS.REJECTED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_CANNOT_EDIT, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updated = yield this._categoryRepository.findByIdAndUpdate(id, data);
            if (!updated)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    }
    toggleCategoryStatus(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this._categoryRepository.findById(id);
            if (!category) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (category.status === constants_1.CATEGORY_STATUS.PENDING ||
                category.status === constants_1.CATEGORY_STATUS.REJECTED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CANNOT_TOGGLE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const newIsActive = !category.isActive;
            const newStatus = newIsActive ? constants_1.CATEGORY_STATUS.ACTIVE : constants_1.CATEGORY_STATUS.INACTIVE;
            yield this._categoryRepository.toggleStatus(id, newIsActive, newStatus);
            return newIsActive;
        });
    }
    getAllCategories(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const invalidStatuses = new Set([
                constants_1.CATEGORY_STATUS.ACTIVE,
                constants_1.CATEGORY_STATUS.INACTIVE,
            ]);
            if (filters.status && !invalidStatuses.has(filters.status)) {
                throw new AppError_1.AppError(`Filter by '${filters.status}' is not permitted`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const data = yield this._categoryRepository.findAllCategory(Object.assign({}, filters));
            return {
                data: data.categories.map(category_mapper_1.CategoryMapper.toResponse),
                totalDocs: data.total,
                currentPage: filters.page,
                totalPages: Math.ceil(data.total / filters.limit),
                stats: data.stats,
            };
        });
    }
    getPendingRequests(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requests, total } = yield this._categoryRepository.findPendingRequests(page, limit, search);
            return {
                data: requests.map(category_mapper_1.CategoryMapper.toRequestResponse),
                totalDocs: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            };
        });
    }
    reviewCategoryRequest(adminId, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const category = yield this._categoryRepository.findById(id);
            if (!category) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_REQUEST_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (category.status !== constants_1.CATEGORY_STATUS.PENDING) {
                throw new AppError_1.AppError(`This request has already been ${category.status}. Cannot review again.`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (data.action === constants_1.APPROVE_REJECT_ACTIONS.APPROVE) {
                const duplicate = yield this._categoryRepository.findByName(category.name);
                if (duplicate && duplicate._id.toString() !== id) {
                    throw new AppError_1.AppError(`An active category named "${category.name}" already exists. ` +
                        `Reject this request and inform the vendor.`, http_status_code_1.HTTP_STATUS.CONFLICT);
                }
                const slug = (0, slug_generator_helper_1.generateSlug)(category.name);
                yield this._categoryRepository.reviewRequest(id, {
                    status: constants_1.CATEGORY_STATUS.ACTIVE,
                    slug,
                    isActive: true,
                    adminId,
                });
                return;
            }
            yield this._categoryRepository.reviewRequest(id, {
                status: constants_1.CATEGORY_STATUS.REJECTED,
                isActive: false,
                adminId,
                rejectionReason: data.rejectionReason.trim(),
            });
        });
    }
    getReviewedRequests(page, limit, search, selectedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requests, total } = yield this._categoryRepository.findReviewedRequest(page, limit, search, selectedFilter);
            return {
                data: requests.map(category_mapper_1.CategoryMapper.toReviewedResponse),
                totalDocs: total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            };
        });
    }
};
exports.CategoryService = CategoryService;
exports.CategoryService = CategoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICategoryRepository')),
    __metadata("design:paramtypes", [Object])
], CategoryService);
