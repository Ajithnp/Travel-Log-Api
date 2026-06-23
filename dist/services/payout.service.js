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
exports.PayoutService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const AppError_1 = require("../errors/AppError");
const roles_1 = require("../shared/constants/roles");
const constants_1 = require("../shared/constants/constants");
const generate_booking_code_helper_1 = require("../shared/utils/generate-booking-code.helper");
const cache_1 = require("../types/cache");
let PayoutService = class PayoutService {
    constructor(_payoutRepository, _paymentGateway, _bookingRepository, _vendorRepository, _scheduleRepository, _cacheService) {
        this._payoutRepository = _payoutRepository;
        this._paymentGateway = _paymentGateway;
        this._bookingRepository = _bookingRepository;
        this._vendorRepository = _vendorRepository;
        this._scheduleRepository = _scheduleRepository;
        this._cacheService = _cacheService;
    }
    getPayoutSchedules(page, limit, search) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._scheduleRepository.getSchedulesForPayout(page, limit, search);
            return {
                data: data.schedules,
                currentPage: page,
                totalPages: Math.ceil(data.total / limit),
                totalDocs: data.total,
            };
        });
    }
    payoutOverview() {
        return __awaiter(this, void 0, void 0, function* () {
            const [completedCount, failedCount, processingCount] = yield Promise.all([
                this._payoutRepository.countDocuments({ status: constants_1.PAYOUT_STATUS.COMPLETED }),
                this._payoutRepository.countDocuments({ status: constants_1.PAYOUT_STATUS.FAILED }),
                this._payoutRepository.countDocuments({ status: constants_1.PAYOUT_STATUS.PROCESSING }),
            ]);
            return { completedCount, failedCount, processingCount };
        });
    }
    schedulePayoutDetails(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = cache_1.CACHE_KEYS.schedulePayoutDetails(scheduleId);
            const cached = yield this._cacheService.get(cacheKey);
            if (cached)
                return cached;
            const schedule = yield this._scheduleRepository.findById(scheduleId);
            if (!schedule) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const [bookingStats, bookingsData, bookingOverViewStats] = yield Promise.all([
                this._bookingRepository.findBookingStatsByScheduleId(scheduleId),
                this._bookingRepository.findAllBookingsByScheduleId(scheduleId),
                this._bookingRepository.payoutOverviewByScheduleId(scheduleId),
            ]);
            if (!bookingStats || !bookingsData) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.SCHEDULE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const result = {
                bookingStats: bookingStats,
                bookingsData: bookingsData,
                bookingOverViewStats: bookingOverViewStats,
            };
            yield this._cacheService.set(cacheKey, result, cache_1.CACHE_TTL.ttl_5_minutes);
            return result;
        });
    }
    releasePayout(scheduleId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const totals = yield this._bookingRepository.findPayableBookingsBySchedule(scheduleId);
            if (!totals || totals.bookingCount === 0) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.NO_PAYABLE_BOOKINGS_FOUND, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const { vendorId, grossAmount, commissionAmount, vendorEarnings, totalAmountFromCancelation, bookingIds, bookingCount, } = totals;
            const netAmount = vendorEarnings + totalAmountFromCancelation;
            const vendorInfo = yield this._vendorRepository.findOne({
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if (!((_a = vendorInfo === null || vendorInfo === void 0 ? void 0 : vendorInfo.transactionConnect) === null || _a === void 0 ? void 0 : _a.payoutsEnabled)) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_PAYOUT_NOT_ENABLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const payout = yield this._payoutRepository.create({
                payoutRefId: (0, generate_booking_code_helper_1.generatePayoutRefId)(),
                vendorId: (0, objectId_helper_1.toObjectId)(vendorId),
                scheduleId: (0, objectId_helper_1.toObjectId)(scheduleId),
                bookingIds: bookingIds,
                grossAmount: grossAmount,
                commissionAmount: commissionAmount,
                netAmount: netAmount,
                status: constants_1.PAYOUT_STATUS.PROCESSING,
                triggeredBy: roles_1.USER_ROLES.ADMIN,
                scheduledAt: new Date(),
            });
            try {
                //  Transfer to vendor via Stripe
                const transferId = yield this._paymentGateway.transferToVendor({
                    amount: netAmount,
                    vendorStripeAccountId: vendorInfo.transactionConnect.accountId,
                    payoutId: payout._id.toString(),
                    vendorId,
                });
                yield this._payoutRepository.updateStatus(payout._id.toString(), constants_1.PAYOUT_STATUS.PROCESSING, {
                    stripeTransferId: transferId,
                });
                return {
                    payoutId: payout._id.toString(),
                    netAmount,
                    transferId,
                    bookingCount: bookingCount,
                };
            }
            catch (error) {
                yield this._payoutRepository.updateStatus(payout._id.toString(), constants_1.PAYOUT_STATUS.FAILED, {
                    failureReason: error.message,
                });
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PAYOUT_FAILED, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
            }
        });
    }
    retryPayout(payoutId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payout = yield this._payoutRepository.findById(payoutId);
            if (!payout) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PAYOUT_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (payout.status !== constants_1.PAYOUT_STATUS.FAILED) {
                throw new AppError_1.AppError(`Payout cannot be retried. Current status: ${payout.status}`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const vendorInfo = yield this._vendorRepository.findOne({
                userId: payout.vendorId,
            });
            if (!((_a = vendorInfo === null || vendorInfo === void 0 ? void 0 : vendorInfo.transactionConnect) === null || _a === void 0 ? void 0 : _a.payoutsEnabled)) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_PAYOUT_NOT_ENABLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._payoutRepository.updateStatus(payoutId, constants_1.PAYOUT_STATUS.PROCESSING, {
                failureReason: null,
                stripeTransferId: null,
            });
            try {
                // Retry the transfer
                const transferId = yield this._paymentGateway.transferToVendor({
                    amount: payout.netAmount,
                    vendorStripeAccountId: vendorInfo.transactionConnect.accountId,
                    payoutId: payout._id.toString(),
                    vendorId: payout.vendorId.toString(),
                });
                yield this._payoutRepository.updateStatus(payoutId, constants_1.PAYOUT_STATUS.PROCESSING, {
                    stripeTransferId: transferId,
                    triggeredBy: roles_1.USER_ROLES.ADMIN,
                });
                return {
                    payoutId: payout._id.toString(),
                    netAmount: payout.netAmount,
                    transferId,
                    bookingCount: payout.bookingIds.length,
                };
            }
            catch (error) {
                yield this._payoutRepository.updateStatus(payoutId, constants_1.PAYOUT_STATUS.FAILED, {
                    failureReason: error.message,
                });
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PAYOUT_FAILED, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
            }
        });
    }
    payoutStats() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._payoutRepository.payoutStats();
            return data;
        });
    }
    findAllPayouts(page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._payoutRepository.findAllPayouts(page, limit, search, filter);
            return {
                data: data.payouts,
                currentPage: page,
                totalPages: Math.ceil(data.total / limit),
                totalDocs: data.total,
            };
        });
    }
    findAllVendorPayouts(vendorId, page, limit, search, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this._payoutRepository.findAllPayoutsByVendor(vendorId, page, limit, search, filter);
            return {
                data: data.payouts,
                currentPage: page,
                totalPages: Math.ceil(data.total / limit),
                totalDocs: data.total,
            };
        });
    }
};
exports.PayoutService = PayoutService;
exports.PayoutService = PayoutService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPayoutRepository')),
    __param(1, (0, tsyringe_1.inject)('IPaymentGateway')),
    __param(2, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(3, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(4, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __param(5, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], PayoutService);
