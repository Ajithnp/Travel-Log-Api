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
exports.PaymentWebhookService = void 0;
const tsyringe_1 = require("tsyringe");
const logger_1 = __importDefault(require("../config/logger"));
const constants_1 = require("../shared/constants/constants");
let PaymentWebhookService = class PaymentWebhookService {
    constructor(_paymentGateway, _bookingService, _couponService, _vendorInfoRepository, _payoutRepository, _schedulePackageRepository) {
        this._paymentGateway = _paymentGateway;
        this._bookingService = _bookingService;
        this._couponService = _couponService;
        this._vendorInfoRepository = _vendorInfoRepository;
        this._payoutRepository = _payoutRepository;
        this._schedulePackageRepository = _schedulePackageRepository;
    }
    handleStripeEvent(rawBody, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = this._paymentGateway.verifyWebhookEvent(rawBody, signature);
            switch (event.type) {
                case 'checkout.session.completed':
                    yield this.handleSessionCompleted(event.data.object);
                    this._couponService.processLuckyDrawCoupons(event.data.object.metadata.userId);
                    break;
                case 'checkout.session.expired':
                    yield this.handleSessionExpired(event.data.object);
                    break;
                case 'account.updated':
                    yield this.handleAccountUpdated(event.data.object);
                    break;
                case 'transfer.created':
                    yield this.handleTransferCreated(event.data.object);
                    break;
                default:
                    break;
            }
        });
    }
    handleSessionCompleted(session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
            if (!bookingId) {
                return;
            }
            yield this._bookingService.confirmBooking({
                userId: session.metadata.userId,
                bookingId,
                stripePaymentIntentId: session.payment_intent,
            });
        });
    }
    handleSessionExpired(session) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const bookingId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.bookingId;
            if (!bookingId)
                return;
            yield this._bookingService.failedBooking(bookingId, session.metadata.userId, session.payment_intent);
        });
    }
    handleAccountUpdated(account) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const vendorId = (_a = account.metadata) === null || _a === void 0 ? void 0 : _a.vendorId;
            if (vendorId) {
                yield this._vendorInfoRepository.updateStripeAccountStatus(vendorId, (_b = account.details_submitted) !== null && _b !== void 0 ? _b : false, (_c = account.charges_enabled) !== null && _c !== void 0 ? _c : false, (_d = account.payouts_enabled) !== null && _d !== void 0 ? _d : false);
            }
            else {
                logger_1.default.warn(`[Webhook] Account ${account.id} updated but no vendorId found in metadata`);
            }
        });
    }
    handleTransferCreated(transfer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const payoutId = (_a = transfer.metadata) === null || _a === void 0 ? void 0 : _a.payoutId;
            if (!payoutId) {
                logger_1.default.warn(`[Webhook] Transfer ${transfer.id} has no payoutId in metadata`);
                return;
            }
            // Mark payout as completed
            yield this._payoutRepository.updateStatus(payoutId, constants_1.PAYOUT_STATUS.COMPLETED, {
                stripeTransferId: transfer.id,
                processedAt: new Date(),
            });
            const payout = yield this._payoutRepository.findById(payoutId);
            if (payout === null || payout === void 0 ? void 0 : payout.scheduleId) {
                yield this._schedulePackageRepository.markSchedulePayoutAsCompleted(payout.scheduleId.toString(), payout._id);
            }
            logger_1.default.info(`[Webhook] Payout ${payoutId} completed via transfer ${transfer.id}`);
        });
    }
};
exports.PaymentWebhookService = PaymentWebhookService;
exports.PaymentWebhookService = PaymentWebhookService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IPaymentGateway')),
    __param(1, (0, tsyringe_1.inject)('IBookingService')),
    __param(2, (0, tsyringe_1.inject)('ICouponService')),
    __param(3, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(4, (0, tsyringe_1.inject)('IPayoutRepository')),
    __param(5, (0, tsyringe_1.inject)('ISchedulePackageRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], PaymentWebhookService);
