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
exports.PublicPackageService = void 0;
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const tsyringe_1 = require("tsyringe");
const category_mapper_1 = require("../../shared/mappers/category.mapper");
const package_mapper_1 = require("../../shared/mappers/package.mapper");
const messages_1 = require("../../shared/constants/messages");
const schedule_mapper_1 = require("../../shared/mappers/schedule.mapper");
let PublicPackageService = class PublicPackageService {
    constructor(_basePackageRepository, _categoryRepository, _schedulePackageRepository, _offerRepository) {
        this._basePackageRepository = _basePackageRepository;
        this._categoryRepository = _categoryRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
        this._offerRepository = _offerRepository;
    }
    getPublicPackages(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = {
                search: query.search,
                category: query.category,
                difficulty: query.difficulty,
                minDuration: query.minDuration,
                maxDuration: query.maxDuration,
                startDate: query.startDate,
                endDate: query.endDate,
                minPrice: query.minPrice,
                maxPrice: query.maxPrice,
                minRating: query.minRating,
                sort: query.sort,
                page: query.page,
                limit: query.limit,
            };
            const { packages, total } = yield this._basePackageRepository.findPublicPackages(filters);
            return {
                packages: packages.map((p) => package_mapper_1.PackageMapper.toPublicListing(p)),
                total,
                currentPage: filters.page,
                limit: filters.limit,
                totalPages: Math.ceil(total / filters.limit),
                hasNextPage: filters.page < Math.ceil(total / filters.limit),
                hasPreviousPage: filters.page > 1,
            };
        });
    }
    getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            const categoriesDoc = yield this._categoryRepository.findActiveCategories();
            return categoriesDoc.map(category_mapper_1.CategoryMapper.toActiveCategoriesResponse);
        });
    }
    getPackageDetails(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkg = yield this._basePackageRepository.findOnePopulatedMany({ _id: packageId }, [
                { path: 'vendorId', select: '_id name' },
                { path: 'categoryId', select: 'name slug' },
                { path: 'cancellationPolicy', select: 'key label description rules' },
            ]);
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const hasOffer = yield this._offerRepository.hasActiveOfferByPackage(packageId);
            const packageDetails = package_mapper_1.PackageMapper.toPublicDetailResponse(Object.assign(Object.assign({}, pkg), { vendorId: pkg.vendorId, categoryId: pkg.categoryId }));
            packageDetails.offerId = hasOffer.offerId;
            packageDetails.offerPercentage = hasOffer.offerPercentage;
            packageDetails.hasOffer = hasOffer.hasOffer;
            return packageDetails;
        });
    }
    getPublicSchedulesByPackage(packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const schedules = yield this._schedulePackageRepository.findPublicSchedulesByPackage(packageId);
            if (!schedules) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            return schedules.map((schedule) => schedule_mapper_1.ScheduleMapper.toPublicSchedule(schedule));
        });
    }
};
exports.PublicPackageService = PublicPackageService;
exports.PublicPackageService = PublicPackageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(1, (0, tsyringe_1.inject)('ICategoryRepository')),
    __param(2, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('IOfferRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], PublicPackageService);
