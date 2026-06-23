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
exports.AdminVendorService = void 0;
const tsyringe_1 = require("tsyringe");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const admin_mapper_1 = require("../../shared/mappers/admin.mapper");
const constants_1 = require("../../shared/constants/constants");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
let AdminVendorService = class AdminVendorService {
    constructor(_vendorInfoRepository, _userRepository, _basePackageRepository, _schedulePackageRepository, _bookingRepository) {
        this._vendorInfoRepository = _vendorInfoRepository;
        this._userRepository = _userRepository;
        this._basePackageRepository = _basePackageRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
        this._bookingRepository = _bookingRepository;
    }
    vendorVerificationRequests(page, limit, search, selectedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const options = {
                skip,
                limit,
                sort: { createdAt: -1 },
            };
            const userSearchQuery = search
                ? { 'user.name': { $regex: search, $options: 'i' } }
                : {};
            const vendorFilter = selectedFilter ? { status: selectedFilter } : {};
            const [vendorsDocs, totalDocs] = yield Promise.all([
                this._vendorInfoRepository.findVendorsVerificationDetails(userSearchQuery, vendorFilter, options),
                this._vendorInfoRepository.countVendorDocuments(userSearchQuery, vendorFilter),
            ]);
            const vendorData = vendorsDocs.map((vendor) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
                const user = vendor.user;
                return {
                    id: vendor._id.toString(),
                    profileLogo: (_c = (_b = (_a = vendor.documents) === null || _a === void 0 ? void 0 : _a.profileLogo) === null || _b === void 0 ? void 0 : _b.key) !== null && _c !== void 0 ? _c : '',
                    isProfileVerified: vendor.isProfileVerified,
                    contactPersonName: (_d = vendor.businessInfo) === null || _d === void 0 ? void 0 : _d.contactPersonName,
                    bio: (_e = vendor.businessInfo) === null || _e === void 0 ? void 0 : _e.bio,
                    businessAddress: (_f = vendor.businessInfo) === null || _f === void 0 ? void 0 : _f.businessAddress,
                    businessLicence: (_j = (_h = (_g = vendor.documents) === null || _g === void 0 ? void 0 : _g.businessLicence) === null || _h === void 0 ? void 0 : _h.key) !== null && _j !== void 0 ? _j : '',
                    ownerIdentity: (_m = (_l = (_k = vendor.documents) === null || _k === void 0 ? void 0 : _k.ownerIdentity) === null || _l === void 0 ? void 0 : _l.key) !== null && _m !== void 0 ? _m : '',
                    GSTIN: (_o = vendor.businessInfo) === null || _o === void 0 ? void 0 : _o.GSTIN,
                    accountNumber: vendor.bankDetails.accountNumber,
                    ifsc: vendor.bankDetails.ifsc,
                    accountHolderName: vendor.bankDetails.accountHolderName,
                    bankName: vendor.bankDetails.bankName,
                    branch: vendor.bankDetails.branch,
                    status: vendor.status,
                    businessPan: (_r = (_q = (_p = vendor.documents) === null || _p === void 0 ? void 0 : _p.businessPan) === null || _q === void 0 ? void 0 : _q.key) !== null && _r !== void 0 ? _r : '',
                    userId: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    reasonForReject: vendor.reasonForReject ? vendor.reasonForReject : '',
                    createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
                };
            });
            return {
                data: vendorData,
                currentPage: page,
                totalPages: Math.ceil(totalDocs / limit),
                totalDocs,
            };
        });
    }
    updateVendorVerification(vendorId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (payload.status === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.REJECTED && !payload.reasonForReject) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REASON_REQUIRED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const vendor = yield this._vendorInfoRepository.findByIdAndUpdate(vendorId, {
                status: payload.status,
                isProfileVerified: true,
                reasonForReject: payload.status === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.REJECTED ? payload.reasonForReject : null,
            }, { new: true });
            if (!vendor) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
        });
    }
    getVendors(page, limit, search, selectedFilter) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            const options = {
                skip,
                limit,
                sort: { createdAt: -1 },
            };
            const vendorSearchQuery = search
                ? { 'user.name': { $regex: search, $options: 'i' } }
                : {};
            const vendorFilter = {};
            if (selectedFilter === 'active')
                vendorFilter['user.isBlocked'] = false;
            if (selectedFilter === 'blocked')
                vendorFilter['user.isBlocked'] = true;
            const matchQuery = { isProfileVerified: true };
            const [vendorsDocs, totalDocs] = yield Promise.all([
                this._vendorInfoRepository.findVendors(vendorSearchQuery, vendorFilter, options),
                this._vendorInfoRepository.countVendorDocuments(vendorSearchQuery, vendorFilter, matchQuery),
            ]);
            const vendorData = vendorsDocs.map((vendor) => ({
                id: vendor.user._id.toString(),
                name: vendor.user.name,
                phone: vendor.user.phone,
                email: vendor.user.email,
                isBlocked: vendor.user.isBlocked,
                createdAt: vendor.user.createdAt.toDateString(),
            }));
            const response = {
                data: vendorData,
                currentPage: page,
                totalPages: Math.ceil(totalDocs / limit),
                totalDocs,
            };
            return response;
        });
    }
    updateVendorAccess(id, block, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendorDoc = yield this._userRepository.findById(id);
            if (!vendorDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const vendorUpdatedDoc = yield this._userRepository.findByIdAndUpdate(id, {
                isBlocked: block,
                blockedReason: block === true ? reason : '',
            });
            if (!vendorUpdatedDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            // if (block && accessToken) {
            //   blacklistToken(accessToken);
            // }
        });
    }
    getVendorProfile(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._vendorInfoRepository.findVendorWithUserId(vendorId);
            if (!vendor) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            return admin_mapper_1.AdminMapper.toVendorProfileResponse(vendor);
        });
    }
    getVendorProfileStats(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalPackages, totalScheduleCompleted, earningsResult] = yield Promise.all([
                this._basePackageRepository.countDocuments({
                    vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                }),
                this._schedulePackageRepository.countDocuments({
                    vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                    status: constants_1.SCHEDULE_STATUS.COMPLETED,
                }),
                this._bookingRepository.getTotalRevanueByVendorId(vendorId),
            ]);
            const totalEarnings = (earningsResult === null || earningsResult === void 0 ? void 0 : earningsResult.totalRevenue) || 0;
            return {
                totalPackages,
                totalScheduleCompleted,
                totalEarnings,
                averageRating: 0,
            };
        });
    }
};
exports.AdminVendorService = AdminVendorService;
exports.AdminVendorService = AdminVendorService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __param(2, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(4, (0, tsyringe_1.inject)('IBookingRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], AdminVendorService);
