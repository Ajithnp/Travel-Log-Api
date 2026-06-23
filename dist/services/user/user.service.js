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
exports.UserService = void 0;
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const booking_1 = require("../../shared/constants/booking");
const constants_1 = require("../../shared/constants/constants");
const error_code_1 = require("../../shared/constants/error-code");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
let UserService = class UserService {
    constructor(_userRepository, _otpService, _bcryptUtils, _emailUtil, _tokenService, _tokenBlackListService, _walletRepository, _bookingRepository, _reviewRepository) {
        this._userRepository = _userRepository;
        this._otpService = _otpService;
        this._bcryptUtils = _bcryptUtils;
        this._emailUtil = _emailUtil;
        this._tokenService = _tokenService;
        this._tokenBlackListService = _tokenBlackListService;
        this._walletRepository = _walletRepository;
        this._bookingRepository = _bookingRepository;
        this._reviewRepository = _reviewRepository;
    }
    profile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userDoc = yield this._userRepository.findById(id);
            if (!userDoc) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const response = {
                id: userDoc._id.toString(),
                role: userDoc.role,
                name: userDoc.name,
                email: userDoc.email,
                phone: userDoc.phone,
                authProvider: userDoc.authProvider,
                createdAt: userDoc.createdAt.toDateString(),
                isBlocked: userDoc.isBlocked,
            };
            return response;
        });
    }
    updateProfile(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = payload, updateData = __rest(payload, ["email"]);
            const user = yield this._userRepository.findOne({ email });
            if (!user)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            if (Object.keys(updateData).length === 0 || Object.values(updateData).length === 0) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.NO_VALID_FIELDS_TO_UPDATE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const updatedUser = yield this._userRepository.findOneAndUpdate({ email }, Object.assign({}, updateData));
            if (!updatedUser)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_UPDATE_FAILED, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
        });
    }
    updateEmailRequest(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = payload;
            const user = yield this._userRepository.findOne({ email });
            if (user) {
                if (user.authProvider === constants_1.AUTH_PROVIDER.GOOGLE) {
                    throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.GOOGLE_USER_CANT_CHANGE_EMAIL, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
                }
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, http_status_code_1.HTTP_STATUS.BAD_REQUEST, error_code_1.ERROR_CODES.EMAIL_ALREADY_EXISTS);
            }
            const { otpExpiresIn, serverTime } = yield this._otpService.sendOtp(email);
            const response = {
                email,
                otpExpiresIn,
                serverTime,
            };
            return response;
        });
    }
    updateEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, refreshToken, oldEmail, email, otp } = payload;
            yield this._otpService.verifyOtp({ email, otp });
            // const  await this._cacheService.get(key);
            const user = yield this._userRepository.findOne({ email });
            if (user)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, http_status_code_1.HTTP_STATUS.BAD_REQUEST, error_code_1.ERROR_CODES.EMAIL_ALREADY_EXISTS);
            yield this._userRepository.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(userId), email: oldEmail }, { email });
            this._emailUtil.sendEmail({
                to: oldEmail,
                subject: 'Email Updated',
                text: 'Your account email was updated',
            });
            this._emailUtil.sendEmail({
                to: email,
                subject: 'Email Updated',
                text: 'Your account email has been updated.',
            });
            // token blacklisting.
            const decoded = this._tokenService.decodeToken(refreshToken);
            if (!decoded || !decoded.exp) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            yield this._tokenBlackListService.blackListToken(refreshToken, decoded.exp.toString());
        });
    }
    resetPassword(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, token, oldPassword, newPassword } = payload;
            const user = yield this._userRepository.findOne({ email });
            if ((user === null || user === void 0 ? void 0 : user.authProvider) === constants_1.AUTH_PROVIDER.GOOGLE) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.GOOGLE_USER_CANT_CHANGE_PASSWORD, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!user)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.EMAIL_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND, error_code_1.ERROR_CODES.USER_NOT_FOUND);
            const isMatch = yield this._bcryptUtils.comparePassword(oldPassword, user.password);
            if (!isMatch)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PASSWORD_INCORRECT, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            const hashedPassword = yield this._bcryptUtils.hashPassword(newPassword);
            yield this._userRepository.findOneAndUpdate({ email }, { password: hashedPassword });
            this._emailUtil.sendEmail({
                to: email,
                subject: 'Password Updated',
                text: 'Your account password was updated',
            });
            const decoded = this._tokenService.decodeToken(token);
            if (!decoded || !decoded.exp) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            this._tokenBlackListService.blackListToken(token, decoded.exp.toString());
        });
    }
    dashboard(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(userId);
            if (!user)
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            const [walletBalance, upcomingTrips, pastTrips, reviewedTrips] = yield Promise.all([
                this._walletRepository.getBalance(userId),
                this._bookingRepository.countDocuments({
                    userId: (0, objectId_helper_1.toObjectId)(userId),
                    bookingStatus: booking_1.BOOKING_STATUS.CONFIRMED,
                }),
                this._bookingRepository.countDocuments({
                    userId: (0, objectId_helper_1.toObjectId)(userId),
                    bookingStatus: booking_1.BOOKING_STATUS.COMPLETED,
                }),
                this._reviewRepository.countDocuments({
                    userId: (0, objectId_helper_1.toObjectId)(userId),
                    isDeleted: false,
                }),
            ]);
            const response = {
                reviewsCount: reviewedTrips,
                walletBalance,
                upcomingTrips,
                pastTrips,
            };
            return response;
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('IOtpService')),
    __param(2, (0, tsyringe_1.inject)('IBcryptUtils')),
    __param(3, (0, tsyringe_1.inject)('IEmailUtils')),
    __param(4, (0, tsyringe_1.inject)('ITokenService')),
    __param(5, (0, tsyringe_1.inject)('ITokenBlackListService')),
    __param(6, (0, tsyringe_1.inject)('IWalletRepository')),
    __param(7, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(8, (0, tsyringe_1.inject)('IReviewRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], UserService);
