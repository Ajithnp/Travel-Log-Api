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
exports.StripeService = void 0;
const tsyringe_1 = require("tsyringe");
const objectId_helper_1 = require("../shared/utils/database/objectId.helper");
const AppError_1 = require("../errors/AppError");
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const vendor_verfication_status_enum_1 = require("../types/enum/vendor-verfication-status.enum");
let StripeService = class StripeService {
    constructor(_vendorInfoRepository, _paymentGateway) {
        this._vendorInfoRepository = _vendorInfoRepository;
        this._paymentGateway = _paymentGateway;
    }
    createOnboardingLink(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const existingDoc = yield this._vendorInfoRepository.findOne({
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if (!existingDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (existingDoc.status !== vendor_verfication_status_enum_1.VENDOR_VERIFICATION_STATUS.APPROVED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_VERIFIED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            let stripeAccountId = (_a = existingDoc.transactionConnect) === null || _a === void 0 ? void 0 : _a.accountId;
            if (!stripeAccountId) {
                // Create new Express account
                stripeAccountId = yield this._paymentGateway.createConnectAccount(vendorId);
                yield this._vendorInfoRepository.updateStripeAccountId(vendorId, stripeAccountId);
            }
            const onboardingUrl = yield this._paymentGateway.createAccountLink(stripeAccountId);
            return { onboardingUrl: onboardingUrl };
        });
    }
    getStripeOnboardingStatus(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const existingDoc = yield this._vendorInfoRepository.findOne({
                userId: (0, objectId_helper_1.toObjectId)(vendorId),
            });
            if (!((_a = existingDoc === null || existingDoc === void 0 ? void 0 : existingDoc.transactionConnect) === null || _a === void 0 ? void 0 : _a.accountId)) {
                return {
                    hasStripeAccount: false,
                    onboardingComplete: false,
                    chargesEnabled: false,
                    payoutsEnabled: false,
                };
            }
            const account = yield this._paymentGateway.retrieveAccount(existingDoc.transactionConnect.accountId);
            const onboardingComplete = (_b = account.details_submitted) !== null && _b !== void 0 ? _b : false;
            const chargesEnabled = (_c = account.charges_enabled) !== null && _c !== void 0 ? _c : false;
            const payoutsEnabled = (_d = account.payouts_enabled) !== null && _d !== void 0 ? _d : false;
            yield this._vendorInfoRepository.updateStripeAccountStatus(vendorId, onboardingComplete, chargesEnabled, payoutsEnabled);
            return {
                hasStripeAccount: true,
                onboardingComplete,
                chargesEnabled,
                payoutsEnabled,
            };
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IVendorInfoRepository')),
    __param(1, (0, tsyringe_1.inject)('IPaymentGateway')),
    __metadata("design:paramtypes", [Object, Object])
], StripeService);
