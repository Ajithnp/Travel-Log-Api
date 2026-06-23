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
exports.PublicVendorService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const package_mapper_1 = require("../../shared/mappers/package.mapper");
let PublicVendorService = class PublicVendorService {
    constructor(_vendorInfoRepository, _basePackageRepository, _schedulePackageRepository) {
        this._vendorInfoRepository = _vendorInfoRepository;
        this._basePackageRepository = _basePackageRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
    }
    getVendorPublicProfile(vendorId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const vendorInfo = yield this._vendorInfoRepository.findVendorWithUserId(vendorId);
            if (!vendorInfo ||
                !vendorInfo.isProfileVerified ||
                vendorInfo.status !== vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.APPROVED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const [{ packages, total }, totalTripsCompleted] = yield Promise.all([
                this._basePackageRepository.findVendorPublicPackages(vendorId, page, limit),
                this._schedulePackageRepository.countCompletedByVendor(vendorId),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                vendor: {
                    businessName: vendorInfo.userId.name,
                    profilePhoto: (_c = (_b = (_a = vendorInfo.documents) === null || _a === void 0 ? void 0 : _a.profileLogo) === null || _b === void 0 ? void 0 : _b.key) !== null && _c !== void 0 ? _c : null,
                    about: null,
                    location: (_e = (_d = vendorInfo.businessInfo) === null || _d === void 0 ? void 0 : _d.businessAddress) !== null && _e !== void 0 ? _e : null,
                    averageRating: 0,
                    totalPackages: total,
                    totalTripsCompleted,
                    createdAt: vendorInfo.userId.createdAt,
                    isVerified: vendorInfo.isProfileVerified,
                },
                packages: packages.map((p) => package_mapper_1.PackageMapper.toPublicListing(p)),
                total,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
            };
        });
    }
};
exports.PublicVendorService = PublicVendorService;
exports.PublicVendorService = PublicVendorService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(1, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(2, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], PublicVendorService);
