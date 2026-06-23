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
exports.UserProfileController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const tsyringe_1 = require("tsyringe");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const AppError_1 = require("../../errors/AppError");
const messages_2 = require("../../shared/constants/messages");
const cookie_helper_1 = require("../../shared/utils/cookie.helper");
const jwt_token_1 = require("../../shared/constants/jwt.token");
let UserProfileController = class UserProfileController {
    constructor(_userService) {
        this._userService = _userService;
        this.profile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            const doc = yield this._userService.profile(user.id);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_2.SUCCESS_MESSAGES.OK,
                data: doc,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateProfile = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const updateProfileRequestPayload = req.body;
            yield this._userService.updateProfile(Object.assign(Object.assign({}, updateProfileRequestPayload), { email: req.user.email }));
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_2.SUCCESS_MESSAGES.PROFILE_UPDATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateEmailRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const updateEmailRequestPayload = req.body;
            const updateEmailData = yield this._userService.updateEmailRequest(updateEmailRequestPayload);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_2.SUCCESS_MESSAGES.OTP_SEND,
                data: updateEmailData,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.updateEmail = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.REFRESH_TOKEN];
            if (!refreshToken) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            yield this._userService.updateEmail(Object.assign(Object.assign({}, req.body), { oldEmail: req.user.email, userId: req.user.id, refreshToken }));
            // force re-authentication
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN);
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_2.SUCCESS_MESSAGES.EMAIL_UPDATED,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
        this.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.REFRESH_TOKEN];
            if (!refreshToken) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, http_status_code_1.HTTP_STATUS.UNAUTHORIZED);
            }
            yield this._userService.resetPassword(Object.assign(Object.assign({}, req.body), { email: req.user.email, token: refreshToken }));
            // Force logout after password reset
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.REFRESH_TOKEN);
            (0, cookie_helper_1.clearAuthCookies)(res, jwt_token_1.JWT_TOKEN.ACCESS_TOKEN);
            const successResponse = {
                success: http_status_code_1.SUCCESS_STATUS.SUCCESS,
                message: messages_2.SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
            };
            res.status(http_status_code_1.HTTP_STATUS.OK).json(successResponse);
        }));
    }
};
exports.UserProfileController = UserProfileController;
exports.UserProfileController = UserProfileController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserService')),
    __metadata("design:paramtypes", [Object])
], UserProfileController);
