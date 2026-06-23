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
exports.AdminService = void 0;
const tsyringe_1 = require("tsyringe");
const roles_1 = require("../../shared/constants/roles");
const constants_1 = require("../../shared/constants/constants");
const vendor_verfication_status_enum_1 = require("../../types/enum/vendor-verfication-status.enum");
const booking_1 = require("../../shared/constants/booking");
const date_helper_1 = require("../../shared/utils/date.helper");
let AdminService = class AdminService {
    constructor(_bookingRepository, _packageRepository, _scheduleRepository, _userRepository, _vendorInfoRepository, _payoutRepository) {
        this._bookingRepository = _bookingRepository;
        this._packageRepository = _packageRepository;
        this._scheduleRepository = _scheduleRepository;
        this._userRepository = _userRepository;
        this._vendorInfoRepository = _vendorInfoRepository;
        this._payoutRepository = _payoutRepository;
    }
    dashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const [users, activeVendors, payout, activePackages, scheduleStats] = yield Promise.all([
                this._userRepository.countDocuments({
                    role: roles_1.USER_ROLES.USER,
                    isBlocked: false,
                    isEmailVerified: true,
                }),
                this._vendorInfoRepository.findActivevendors(),
                this._payoutRepository.getTotalEarnings(),
                this._packageRepository.countDocuments({
                    status: constants_1.PACKAGE_STATUS.PUBLISHED,
                    isDeleted: false,
                }),
                this._scheduleRepository.getScheduleStats(),
            ]);
            return {
                totalUsers: users,
                totalVendors: activeVendors,
                totalBookings: payout.totalBookings,
                totalRevenue: payout.totalCommission,
                totalVendorEarnings: payout.totalVendorEarnings,
                activePackages: activePackages,
                totalScheduleCompleted: scheduleStats.completedSchedules,
                activeSchedules: scheduleStats.activeSchedules,
            };
        });
    }
    dashboardTopPerformers() {
        return __awaiter(this, void 0, void 0, function* () {
            const [top5Vendors, top5Packages] = yield Promise.all([
                this._vendorInfoRepository.findTop5Vendors(),
                this._payoutRepository.findTop5Packages(),
            ]);
            return {
                top5Vendors,
                top5Packages,
            };
        });
    }
    dashboardActionsRequired() {
        return __awaiter(this, void 0, void 0, function* () {
            const [pendingVendorVerifications, pendingCancellationRequests, pendingPayouts, failedPayouts] = yield Promise.all([
                this._vendorInfoRepository.countDocuments({
                    status: vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.UNDER_REVIEW,
                }),
                this._bookingRepository.countDocuments({ cancellationStatus: booking_1.CANCELATION_STATUS.PENDING }),
                this._scheduleRepository.getPayoutSchedulesCount(),
                this._payoutRepository.countDocuments({ status: constants_1.PAYOUT_STATUS.FAILED }),
            ]);
            return {
                pendingVendorVerifications,
                pendingCancellationRequests,
                pendingPayouts,
                failedPayouts,
            };
        });
    }
    dashboardRevenueTrend(period, customFrom, customTo) {
        return __awaiter(this, void 0, void 0, function* () {
            const customFromDate = customFrom ? new Date(customFrom) : undefined;
            const customToDate = customTo ? new Date(customTo) : undefined;
            const { from, now } = (0, date_helper_1.getDateRange)(period, customFromDate, customToDate);
            const granularity = (0, date_helper_1.getGranularity)(from, now, period);
            const revenueTrend = yield this._payoutRepository.platformRevenueTrend(from, now, granularity);
            const trend = revenueTrend.map((r) => ({
                date: r._id,
                totalRevanue: Math.round(r.totalRevenue),
                totalCommission: Math.round(r.totalCommission),
                totalVendorEarnings: Math.round(r.totalVendorEarnings),
            }));
            return {
                granularity,
                trend,
            };
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(1, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(2, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(3, (0, tsyringe_1.inject)('IUserRepository')),
    __param(4, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(5, (0, tsyringe_1.inject)('IPayoutRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], AdminService);
