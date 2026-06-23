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
exports.OtpService = void 0;
const tsyringe_1 = require("tsyringe");
const otp_generator_helper_1 = require("../shared/utils/otp/otp.generator.helper");
const AppError_1 = require("../errors/AppError");
const messages_1 = require("../shared/constants/messages");
const http_status_code_1 = require("../shared/constants/http_status_code");
const otp_hash_helper_1 = require("../shared/utils/otp/otp.hash.helper");
const otp_1 = require("../shared/constants/otp");
const email_templates_1 = require("../shared/templates/email_templates");
let OtpService = class OtpService {
    constructor(_emailUtil, _cacheService) {
        this._emailUtil = _emailUtil;
        this._cacheService = _cacheService;
    }
    sendOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const { otp, expiresAt } = (0, otp_generator_helper_1.generateOtpWithExpiry)();
            const hashedOtp = (0, otp_hash_helper_1.hashOtp)(otp, email);
            const key = `otp:${email}`;
            yield this._cacheService.set(key, hashedOtp, otp_1.OTP.OTP_TTL_SECONDS);
            this._emailUtil.sendEmail({
                to: email,
                subject: 'verify Your Email Adress',
                html: (0, email_templates_1.ACCOUNT_VERIFICATION)(otp, 'Account Verification'),
            });
            const response = {
                otpExpiresIn: expiresAt,
                serverTime: Math.floor(Date.now() / 1000),
            };
            return response;
        });
    }
    verifyOtp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, otp } = data;
            const key = `otp:${email}`;
            const hashedOtp = (0, otp_hash_helper_1.hashOtp)(otp, email);
            const storedOtp = yield this._cacheService.get(key);
            console.log('hased otp', hashedOtp);
            console.log('stored otp', storedOtp);
            if (!storedOtp) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.OTP_EXPIRED, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (hashedOtp !== storedOtp) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.INVALID_OTP, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._cacheService.del(key);
        });
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IEmailUtils')),
    __param(1, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object])
], OtpService);
