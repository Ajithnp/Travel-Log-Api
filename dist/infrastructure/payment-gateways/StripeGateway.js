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
exports.StripeGateway = void 0;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../../config/env");
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const constants_1 = require("../../shared/constants/constants");
let StripeGateway = class StripeGateway {
    constructor() {
        this.stripe = new stripe_1.default(env_1.config.payment.STRIPE_SECRET_KEY, {
            apiVersion: '2026-04-22.dahlia',
            typescript: true,
        });
    }
    // ── Checkout session ──────
    createPaymentIntent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            try {
                const session = yield this.stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    mode: 'payment',
                    line_items: [
                        {
                            quantity: 1,
                            price_data: {
                                currency: (_a = data.currency) !== null && _a !== void 0 ? _a : 'inr',
                                unit_amount: Math.round(data.amount * 100), // rupees → paise
                                product_data: {
                                    name: (_c = (_b = data.metadata) === null || _b === void 0 ? void 0 : _b.packageName) !== null && _c !== void 0 ? _c : 'Travel Package',
                                    description: [
                                        ((_d = data.metadata) === null || _d === void 0 ? void 0 : _d.tierType) ? `Tier: ${data.metadata.tierType}` : null,
                                        ((_e = data.metadata) === null || _e === void 0 ? void 0 : _e.seatsCount) ? `Seats: ${data.metadata.seatsCount}` : null,
                                        ((_f = data.metadata) === null || _f === void 0 ? void 0 : _f.startDate) && ((_g = data.metadata) === null || _g === void 0 ? void 0 : _g.endDate)
                                            ? `Travel: ${data.metadata.startDate} → ${data.metadata.endDate}`
                                            : null,
                                    ]
                                        .filter(Boolean)
                                        .join(' | '),
                                },
                            },
                        },
                    ],
                    metadata: {
                        bookingId: data.bookingId,
                        bookingCode: data.bookingCode,
                        userId: (_j = (_h = data.metadata) === null || _h === void 0 ? void 0 : _h.userId) !== null && _j !== void 0 ? _j : '',
                        scheduleId: (_l = (_k = data.metadata) === null || _k === void 0 ? void 0 : _k.scheduleId) !== null && _l !== void 0 ? _l : '',
                        tierType: (_o = (_m = data.metadata) === null || _m === void 0 ? void 0 : _m.tierType) !== null && _o !== void 0 ? _o : '',
                        seatsCount: (_q = (_p = data.metadata) === null || _p === void 0 ? void 0 : _p.seatsCount) !== null && _q !== void 0 ? _q : '',
                        startDate: (_s = (_r = data.metadata) === null || _r === void 0 ? void 0 : _r.startDate) !== null && _s !== void 0 ? _s : '',
                        endDate: (_u = (_t = data.metadata) === null || _t === void 0 ? void 0 : _t.endDate) !== null && _u !== void 0 ? _u : '',
                        packageName: (_w = (_v = data.metadata) === null || _v === void 0 ? void 0 : _v.packageName) !== null && _w !== void 0 ? _w : '',
                    },
                    success_url: `${env_1.config.cors.ALLOWED_ORIGINS}/user/booking/confirm?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${env_1.config.cors.ALLOWED_ORIGINS}/payment/cancel?session_id={CHECKOUT_SESSION_ID}&bookingId=${data.bookingId}`,
                });
                if (!session.url) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PAYMENT_CONFIRMATION_FAILED, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                return {
                    gatewayPaymentId: session.id,
                    clientSecret: (_x = session.client_secret) !== null && _x !== void 0 ? _x : '',
                    url: session.url,
                };
            }
            catch (error) {
                if (error instanceof stripe_1.default.errors.StripeError) {
                    throw new AppError_1.AppError(`Stripe error: ${error.message}`, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
                }
                throw error;
            }
        });
    }
    // ── Webhook verification ──
    verifyWebhookEvent(rawBody, signature) {
        try {
            return this.stripe.webhooks.constructEvent(rawBody, signature, env_1.config.payment.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            throw new AppError_1.AppError(`Webhook signature verification failed: ${err.message}`, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
        }
    }
    verifyStripeSession(stripeSessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.stripe.checkout.sessions.retrieve(stripeSessionId);
            }
            catch (err) {
                throw new AppError_1.AppError(`Failed to retrieve Stripe session: ${err.message}`, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
            }
        });
    }
    retrieveSession(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.stripe.checkout.sessions.retrieve(sessionId);
            }
            catch (err) {
                throw new AppError_1.AppError(`Failed to retrieve Stripe session: ${err.message}`, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
            }
        });
    }
    createConnectAccount(vendorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = yield this.stripe.accounts.create({
                type: 'express',
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: { vendorId },
            });
            return account.id;
        });
    }
    createAccountLink(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            const link = yield this.stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${env_1.config.cors.ALLOWED_ORIGINS}/vendor/stripe/refresh`,
                return_url: `${env_1.config.cors.ALLOWED_ORIGINS}/vendor/stripe/return`,
                type: 'account_onboarding',
            });
            return link.url;
        });
    }
    retrieveAccount(accountId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.stripe.accounts.retrieve(accountId);
        });
    }
    transferToVendor(transferParams) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const account = yield this.stripe.accounts.retrieve(transferParams.vendorStripeAccountId);
                if (!account.charges_enabled) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_CHARGES_ENABLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (!account.payouts_enabled) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_PAYOUTS_ENABLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (((_a = account === null || account === void 0 ? void 0 : account.capabilities) === null || _a === void 0 ? void 0 : _a.transfers) !== 'active') {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.VENDOR_NOT_TRANSFERS_ENABLED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                const transfer = yield this.stripe.transfers.create({
                    amount: Math.round((transferParams.amount / constants_1.INR_TO_USD_TEST_RATE) * 100),
                    // currency: 'inr',
                    currency: 'usd',
                    destination: transferParams.vendorStripeAccountId,
                    metadata: {
                        payoutId: transferParams.payoutId,
                        vendorId: transferParams.vendorId,
                    },
                });
                return transfer.id;
            }
            catch (err) {
                if (err instanceof stripe_1.default.errors.StripeError) {
                    throw new AppError_1.AppError(`Stripe error: ${err.message}`, http_status_code_1.HTTP_STATUS.BAD_GATEWAY);
                }
                throw err;
            }
        });
    }
};
exports.StripeGateway = StripeGateway;
exports.StripeGateway = StripeGateway = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], StripeGateway);
