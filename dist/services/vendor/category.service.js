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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorCategoryService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../../shared/constants/constants");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const slug_generator_helper_1 = require("../../shared/utils/slug.generator.helper");
const category_mapper_1 = require("../../shared/mappers/category.mapper");
let VendorCategoryService = class VendorCategoryService {
    constructor(_categoryRepository) {
        this._categoryRepository = _categoryRepository;
        this.MAX_VENDOR_PENDING_REQUESTS = 3;
    }
    getRequestedcategories(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data, total } = yield this._categoryRepository.findVendorCategory(vendorId, filters);
            return {
                data: data.map(category_mapper_1.CategoryMapper.toVendorRequestResponse),
                totalDocs: total,
                currentPage: filters.page,
                totalPages: Math.ceil(total / filters.limit),
            };
        });
    }
    requestCategory(vendorId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = data.name.trim();
            const activeExisting = yield this._categoryRepository.findByName(name);
            if (activeExisting && activeExisting.status === constants_1.CATEGORY_STATUS.ACTIVE) {
                throw new AppError_1.AppError(`The category "${name}" already exists. You can select it from the dropdown.`, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            // Check if THIS vendor already requested this name (any status)
            const duplicateRequest = yield this._categoryRepository.findDuplicateRequest(vendorId, name);
            if (duplicateRequest) {
                const statusMsg = duplicateRequest.status === constants_1.CATEGORY_STATUS.PENDING
                    ? 'is currently pending admin review'
                    : duplicateRequest.status === constants_1.CATEGORY_STATUS.REJECTED
                        ? 'was previously rejected'
                        : 'already exists';
                throw new AppError_1.AppError(`You already requested a category named "${name}" — it ${statusMsg}.`, http_status_code_1.HTTP_STATUS.CONFLICT);
            }
            // max 3 pending requests per vendor
            const pendingCount = yield this._categoryRepository.countPendingByVendor(vendorId);
            if (pendingCount >= this.MAX_VENDOR_PENDING_REQUESTS) {
                throw new AppError_1.AppError(`You have ${pendingCount} pending category requests. ` +
                    `Wait for admin review before submitting more.`, http_status_code_1.HTTP_STATUS.TOO_MANY_REQUESTS);
            }
            const slug = (0, slug_generator_helper_1.generateSlug)(data.name);
            const slugExist = yield this._categoryRepository.findBySlug(slug);
            if (slugExist) {
                throw new AppError_1.AppError(`Your requested  category named "${slugExist.name}" is already exist.`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._categoryRepository.create({
                name,
                vendorNote: data.vendorNote,
                requestedBy: new mongoose_1.default.Types.ObjectId(vendorId),
            });
        });
    }
    getActiveCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this._categoryRepository.findActiveCategories();
            return categories.map(category_mapper_1.CategoryMapper.toActiveCategoriesResponse);
        });
    }
};
exports.VendorCategoryService = VendorCategoryService;
exports.VendorCategoryService = VendorCategoryService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICategoryRepository')),
    __metadata("design:paramtypes", [Object])
], VendorCategoryService);
