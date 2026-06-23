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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageService = void 0;
const tsyringe_1 = require("tsyringe");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const constants_1 = require("../../shared/constants/constants");
const package_mapper_1 = require("../../shared/mappers/package.mapper");
let PackageService = class PackageService {
    constructor(_basePackageRepository, _vendorInfoRepository, _fileStorageHandlerService, _categoryRepository, _scheduleRepository, _reviewRepository, _offerRepository) {
        this._basePackageRepository = _basePackageRepository;
        this._vendorInfoRepository = _vendorInfoRepository;
        this._fileStorageHandlerService = _fileStorageHandlerService;
        this._categoryRepository = _categoryRepository;
        this._scheduleRepository = _scheduleRepository;
        this._reviewRepository = _reviewRepository;
        this._offerRepository = _offerRepository;
    }
    processPackageImages(images) {
        return __awaiter(this, void 0, void 0, function* () {
            const uploaded = images.filter((img) => img.status === 'UPLOADED');
            const removed = images.filter((img) => img.status === 'REMOVED');
            if (removed.length > 0) {
                yield Promise.all(removed.map((img) => this._fileStorageHandlerService.deleteFile(img.key)));
            }
            return uploaded.map((img) => ({ key: img.key }));
        });
    }
    fetchPackages(vendorId, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requests, total } = yield this._basePackageRepository.findPackages(vendorId, filters);
            const response = {
                data: requests.map(package_mapper_1.PackageMapper.toResponse),
                currentPage: filters.page,
                totalPages: Math.ceil(total / filters.limit),
                totalDocs: total,
            };
            return response;
        });
    }
    fetchPackagesWithId(vendorId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorObjectId = (0, objectId_helper_1.toObjectId)(vendorId);
            const packageObjectId = (0, objectId_helper_1.toObjectId)(packageId);
            const packageExist = yield this._basePackageRepository.findOnePopulatedMany({
                _id: packageObjectId,
                vendorId: vendorObjectId,
            }, [
                { path: 'categoryId', select: 'name' },
                { path: 'cancellationPolicy', select: '_id label key' },
            ]);
            if (!packageExist) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const [scheduleCount, activeOfferCount, reviweStats] = yield Promise.all([
                this._scheduleRepository.countDocuments({
                    packageId: packageObjectId,
                    status: { $in: [constants_1.SCHEDULE_STATUS.UPCOMING, constants_1.SCHEDULE_STATUS.SOLD_OUT] },
                }),
                this._offerRepository.hasActiveOfferByPackage(packageId),
                this._reviewRepository.getAverageRating(packageId),
            ]);
            const response = package_mapper_1.PackageMapper.toDetailResponse(packageExist);
            return Object.assign(Object.assign({}, response), { activeOffer: activeOfferCount, reviewStats: reviweStats, scheduleCount: scheduleCount });
        });
    }
    createPackage(vendorId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorObjectId = (0, objectId_helper_1.toObjectId)(vendorId);
            const vendor = yield this._vendorInfoRepository.findVendorWithUserId(vendorId);
            if (!vendor || vendor.status !== vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.APPROVED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_VERIFIED, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            if (payload.title) {
                const existingPublished = yield this._basePackageRepository.findOne({
                    vendorId: vendorObjectId,
                    title: payload.title,
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                });
                if (existingPublished) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_ALREADY_EXISTS, http_status_code_1.HTTP_STATUS.CONFLICT);
                }
            }
            let categoryObjectId;
            if (payload.categoryId) {
                categoryObjectId = (0, objectId_helper_1.toObjectId)(payload.categoryId);
                const category = yield this._categoryRepository.findById(payload.categoryId);
                if (!category) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (!category.isActive) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_ACTIVE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            let imageKeys;
            if (payload.images && payload.images.length > 0) {
                imageKeys = yield this.processPackageImages(payload.images);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { categoryId, images, cancellationPolicy } = payload, restPayload = __rest(payload, ["categoryId", "images", "cancellationPolicy"]);
            let cancellationPolicyObjectId;
            if (cancellationPolicy) {
                cancellationPolicyObjectId = (0, objectId_helper_1.toObjectId)(cancellationPolicy);
            }
            const newPackage = yield this._basePackageRepository.create(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, restPayload), { vendorId: vendorObjectId }), (categoryObjectId && { categoryId: categoryObjectId })), (imageKeys && { images: imageKeys })), (cancellationPolicyObjectId && { cancellationPolicy: cancellationPolicyObjectId })));
            return { packageId: newPackage._id.toString() };
        });
    }
    updatePackage(vendorId, packageId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorObjectId = (0, objectId_helper_1.toObjectId)(vendorId);
            const packageObjectId = (0, objectId_helper_1.toObjectId)(packageId);
            const existingPackage = yield this._basePackageRepository.findOne({
                _id: packageObjectId,
                vendorId: vendorObjectId,
            });
            if (!existingPackage) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (existingPackage.status === constants_1.PACKAGE_STATUS.DELETED ||
                existingPackage.status === constants_1.PACKAGE_STATUS.PUBLISHED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_CANNOT_EDIT, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { categoryId, cancellationPolicy } = payload, restPayload = __rest(payload, ["categoryId", "cancellationPolicy"]);
            let categoryObjectId;
            if (categoryId) {
                const category = yield this._categoryRepository.findById(categoryId);
                if (!category) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                }
                if (!category.isActive) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.CATEGORY_NOT_ACTIVE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                categoryObjectId = (0, objectId_helper_1.toObjectId)(categoryId);
            }
            let imageKeys;
            if (payload.images) {
                imageKeys = yield this.processPackageImages(payload.images);
            }
            let cancellationPolicyObjectId;
            if (cancellationPolicy) {
                cancellationPolicyObjectId = (0, objectId_helper_1.toObjectId)(cancellationPolicy);
            }
            yield this._basePackageRepository.findOneAndUpdate({ _id: packageObjectId }, Object.assign(Object.assign(Object.assign(Object.assign({}, restPayload), (categoryObjectId && { categoryId: categoryObjectId })), (imageKeys && { images: imageKeys })), (cancellationPolicyObjectId && { cancellationPolicy: cancellationPolicyObjectId })));
        });
    }
    fetchPackageScheduleContext(vendorId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorObjectId = (0, objectId_helper_1.toObjectId)(vendorId);
            const packageObjectId = (0, objectId_helper_1.toObjectId)(packageId);
            const pkg = yield this._basePackageRepository.findOnePopulatedMany({
                _id: packageObjectId,
                vendorId: vendorObjectId,
            }, [
                { path: 'categoryId', select: 'name' },
                { path: 'cancellationPolicy', select: '_id label key' },
            ]);
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (pkg.status !== constants_1.PACKAGE_STATUS.PUBLISHED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_PUBLISHED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            return package_mapper_1.PackageMapper.toScheduleContext(pkg);
        });
    }
    deletePackage(packageId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packageObjectId = (0, objectId_helper_1.toObjectId)(packageId);
            const isPackageExist = yield this._basePackageRepository.findOne({ _id: packageObjectId });
            if (!isPackageExist) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (isPackageExist.isDeleted) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_ALREADY_DELETED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const isScheduleExists = yield this._scheduleRepository.findOne({
                packageId: packageObjectId,
                status: constants_1.SCHEDULE_STATUS.UPCOMING,
            });
            if (isScheduleExists) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_HAS_ACTIVE_SCHEDULE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const data = yield this._basePackageRepository.softDelete(packageObjectId, vendorId);
            if (!data) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
        });
    }
    restorePackage(packageId, vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const product = yield this._basePackageRepository.restore(packageId, vendorId);
            if (!product) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
        });
    }
    getPackagesForOffer(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packagesWithOffers = yield this._basePackageRepository.findPackagesByVendorIdForOffer(vendorId);
            return packagesWithOffers.map((pkg) => package_mapper_1.PackageMapper.toOfferResponse(pkg));
        });
    }
    packageMetaData(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const packages = yield this._basePackageRepository.packageMetaDataByVendorId(vendorId);
            return packages;
        });
    }
};
exports.PackageService = PackageService;
exports.PackageService = PackageService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(1, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(2, (0, tsyringe_1.inject)('IFileStorageHandlerService')),
    __param(3, (0, tsyringe_1.inject)('ICategoryRepository')),
    __param(4, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(5, (0, tsyringe_1.inject)('IReviewRepository')),
    __param(6, (0, tsyringe_1.inject)('IOfferRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], PackageService);
