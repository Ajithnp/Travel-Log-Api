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
exports.VendorService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const date_helper_1 = require("../../shared/utils/date.helper");
const booking_1 = require("../../shared/constants/booking");
const constants_1 = require("../../shared/constants/constants");
let VendorService = class VendorService {
    constructor(_vendorInfoRepository, _userRepository, _fileStorage, _payoutRepository, _bookingRepository, _packageRepository, _scheduleRepository) {
        this._vendorInfoRepository = _vendorInfoRepository;
        this._userRepository = _userRepository;
        this._fileStorage = _fileStorage;
        this._payoutRepository = _payoutRepository;
        this._bookingRepository = _bookingRepository;
        this._packageRepository = _packageRepository;
        this._scheduleRepository = _scheduleRepository;
    }
    profile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const vendorDoc = yield this._vendorInfoRepository.findVendorWithUserId(userId);
            if (!vendorDoc ||
                vendorDoc.status === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.PENDING ||
                vendorDoc.status === vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.REJECTED) {
                const userDoc = yield this._userRepository.findById(userId);
                if (!userDoc)
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
                return {
                    id: userDoc._id.toString(),
                    name: userDoc.name,
                    email: userDoc.email,
                    phone: userDoc.phone,
                    role: userDoc.role,
                    profileLogo: null,
                    businessAddress: null,
                    contactPersonName: null,
                    isProfileVerified: false,
                    status: (vendorDoc === null || vendorDoc === void 0 ? void 0 : vendorDoc.status) ? vendorDoc.status : vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.PENDING,
                    reasonForReject: (vendorDoc === null || vendorDoc === void 0 ? void 0 : vendorDoc.reasonForReject) ? vendorDoc.reasonForReject : '',
                    createdAt: userDoc.createdAt,
                };
            }
            return {
                id: vendorDoc._id.toString(),
                name: vendorDoc.userId.name,
                email: vendorDoc.userId.email,
                phone: vendorDoc.userId.phone,
                role: vendorDoc.userId.role,
                profileLogo: (_b = (_a = vendorDoc.documents) === null || _a === void 0 ? void 0 : _a.profileLogo) === null || _b === void 0 ? void 0 : _b.key,
                businessAddress: (_c = vendorDoc.businessInfo) === null || _c === void 0 ? void 0 : _c.businessAddress,
                contactPersonName: (_d = vendorDoc.businessInfo) === null || _d === void 0 ? void 0 : _d.contactPersonName,
                isProfileVerified: vendorDoc.isProfileVerified,
                userId: ((_e = vendorDoc.userId) === null || _e === void 0 ? void 0 : _e._id).toString(),
                status: vendorDoc.status,
                reasonForReject: (vendorDoc === null || vendorDoc === void 0 ? void 0 : vendorDoc.reasonForReject) ? vendorDoc.reasonForReject : '',
                createdAt: vendorDoc === null || vendorDoc === void 0 ? void 0 : vendorDoc.createdAt,
            };
        });
    }
    updateProfileLogo(vendorId, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const vendorDoc = yield this._vendorInfoRepository.findVendorWithUserId(vendorId);
            if (!vendorDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if ((_b = (_a = vendorDoc.documents) === null || _a === void 0 ? void 0 : _a.profileLogo) === null || _b === void 0 ? void 0 : _b.key) {
                yield this._fileStorage.deleteFile((_c = vendorDoc.documents) === null || _c === void 0 ? void 0 : _c.profileLogo.key);
            }
            const file = payload.files[0];
            yield this._vendorInfoRepository.findByIdAndUpdate(payload.vendorInfoId, {
                'documents.profileLogo': {
                    key: file.key,
                    fieldName: 'companyLogo',
                },
            });
        });
    }
    getSummaryStats(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vendor = yield this._userRepository.findOne({ _id: (0, objectId_helper_1.toObjectId)(vendorId) });
            if (!vendor)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            const [revanueStats, totalBookings, totalPackages, scheduleStats] = yield Promise.all([
                this._payoutRepository.revenueStatsByVendor(vendorId),
                this._bookingRepository.countDocuments({
                    vendorId: vendorId,
                    bookingStatus: { $in: [booking_1.BOOKING_STATUS.COMPLETED, booking_1.BOOKING_STATUS.CONFIRMED] },
                }),
                this._packageRepository.countDocuments({
                    vendorId: vendorId,
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                    isActive: true,
                }),
                this._scheduleRepository.scheduledStatsByVendor(vendorId),
            ]);
            return {
                revanueStats,
                totalBookings,
                totalPackages,
                scheduleStats,
            };
        });
    }
    getDashboardAnalytics(vendorId, period, customFrom, customTo) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from, now } = (0, date_helper_1.getDateRange)(period, customFrom, customTo);
            const granularity = (0, date_helper_1.getGranularity)(from, now, period);
            const [rawTrend, bookingsByPackage] = yield Promise.all([
                this._bookingRepository.getAnalytics(vendorId, from, now, granularity),
                this._bookingRepository.getTopPerformingPackages(vendorId),
            ]);
            const trend = rawTrend.map((r) => ({
                date: r._id,
                bookings: r.count,
                revenue: Math.round(r.revenue),
            }));
            return {
                granularity,
                trend,
                bookingsByPackage: bookingsByPackage,
            };
        });
    }
    dashboardRecentActivity(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const [bookings, schedules] = yield Promise.all([
                this._bookingRepository.getRecentActivity(vendorId),
                this._scheduleRepository.getUpcomingSchedules(vendorId),
            ]);
            return {
                bookings,
                schedules,
            };
        });
    }
};
exports.VendorService = VendorService;
exports.VendorService = VendorService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __param(2, (0, tsyringe_1.inject)('IFileStorageHandlerService')),
    __param(3, (0, tsyringe_1.inject)('IPayoutRepository')),
    __param(4, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(5, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(6, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], VendorService);
