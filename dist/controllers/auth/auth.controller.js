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
exports.AuthController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tsyringe_1 = require("tsyringe");
const cookie_helper_1 = require("../../shared/utils/cookie.helper");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const AppError_1 = require("../../errors/AppError");
const jwt_token_1 = require("../../shared/constants/jwt.token");
let AuthController = class AuthController {
    constructor(_authService, _otpService) {
        this._authService = _authService;
        this._otpService = _otpService;
        this.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const loginPayload = req.body;
            const { user, accessToken, refreshToken } = yield this._authService.loginUser(loginPayload);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN, accessToken, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN, refreshToken, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
                data: user,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //===================================================================================
        this.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const registerPayload = req.body;
            const user = yield this._authService.registerUser(registerPayload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
                data: user,
            };
            res.status(http_status_code_1.HTTP_STATUS.CREATED).json(successResponse);
        }));
        //===============================================================================
        this.verifyEmail = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const verificationPayload = req.body;
            console.log('input', verificationPayload);
            const { user, accessToken, refreshToken } = yield this._authService.emailVerify(verificationPayload);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN, accessToken, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN, refreshToken, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.EMAIL_VERIFIED,
                data: user,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //==========================================================================================
        this.resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            const otpData = yield this._otpService.sendOtp(email);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.RESEND_OTP_SUCCESS,
                data: otpData,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //===============================================================================================
        this.googleAuthCallback = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const googleAuthPayload = req.body;
            const { user, accessToken, refreshToken, isNewUser } = yield this._authService.googleAuthentication(googleAuthPayload);
            // setting cookies
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN, accessToken, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN, refreshToken, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
                data: user,
            };
            res.status(isNewUser ? http_status_code_1.HTTP_STATUS.CREATED : http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //=====================================================================================
        this.forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const forgotPasswordPayload = req.body;
            const user = yield this._authService.forgotPassword(forgotPasswordPayload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OTP_SEND,
                data: user,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //========================================================================================
        this.verifyOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const verifyOtpPayload = req.body;
            yield this._otpService.verifyOtp(verifyOtpPayload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.OTP_VERIFIED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //========================================================================================
        this.changePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const passwordChangePayload = req.body;
            yield this._authService.changePassword(passwordChangePayload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //======================================================================================
        this.refreshAccessToken = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.REFRESH_TOKEN];
            if (!refreshToken) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            const { accessToken } = yield this._authService.refreshAccessToken({ refreshToken });
            // Replace old access token cookie
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN);
            (0, cookie_helper_1.setAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN, accessToken, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.TOKEN_REFRESHED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        //=====================================================================================
        this.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN);
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_1.SUCCESS_MESSAGES.LOGOUT_SUCCESS,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAuthService')),
    __param(1, (0, tsyringe_1.inject)('IOtpService')),
    __metadata("design:paramtypes", [Object, Object])
], AuthController);
