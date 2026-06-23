"use strict";
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
exports.optionalAuth = exports.isAuthenticated = void 0;
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
const tsyringe_1 = require("tsyringe");
const di_tokens_1 = require("../shared/constants/di.tokens");
const di_tokens_2 = require("../shared/constants/di.tokens");
const http_status_code_2 = require("../shared/constants/http_status_code");
const jwt_token_1 = require("../shared/constants/jwt.token");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.ACCESS_TOKEN];
    if (!token) {
        res.status(http_status_code_1.HTTP_STATUS.UNAUTHORIZED).json({
            success: http_status_code_2.SUCCESS_STATUS.FAILURE,
            message: messages_1.ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED,
        });
        return;
    }
    try {
        const tokenService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_SERVICE);
        const decode = tokenService.verifyAccessToken(token);
        if (!decode) {
            res.status(http_status_code_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: http_status_code_2.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.AUTH_INVALID_TOKEN,
            });
            return;
        }
        const tokenBlackListService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_BLACKLIST);
        const isBlackListed = yield tokenBlackListService.isBlackListed(token);
        if (isBlackListed) {
            res.status(http_status_code_1.HTTP_STATUS.UNAUTHORIZED).json({
                success: http_status_code_2.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.SESSION_EXPIRED,
            });
            return;
        }
        req.user = decode;
        const userRepository = tsyringe_1.container.resolve(di_tokens_2.REPOSITORY_TOKENS.USER_REPOSITORY);
        const user = yield userRepository.findOne({ email: req.user.email });
        if (!user) {
            res.status(http_status_code_1.HTTP_STATUS.NOT_FOUND).json({
                success: http_status_code_2.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.USER_NOT_FOUND,
            });
            return;
        }
        if (user.isBlocked) {
            res.status(http_status_code_1.HTTP_STATUS.FORBIDDEN).json({
                success: http_status_code_2.SUCCESS_STATUS.FAILURE,
                message: messages_1.ERROR_MESSAGES.ACCOUNT_BLOCKED,
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error(error);
        res.status(http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: http_status_code_2.SUCCESS_STATUS.FAILURE,
            message: messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,
        });
    }
});
exports.isAuthenticated = isAuthenticated;
/**
 * Optional authentication middleware.
 * Decodes the JWT and sets req.user if a valid token is present.
 *  calls next() without error if no token is provided — keeps the route public.
 */
const optionalAuth = (req, _res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a[jwt_token_1.JWT_TOKEN.ACCESS_TOKEN];
    if (!token) {
        return next();
    }
    try {
        const tokenService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_SERVICE);
        const decode = tokenService.verifyAccessToken(token);
        if (!decode)
            return next();
        const tokenBlackListService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_BLACKLIST);
        const isBlackListed = yield tokenBlackListService.isBlackListed(token);
        if (isBlackListed)
            return next();
        req.user = decode;
    }
    catch (_b) {
        // Invalid token — proceed as guest
    }
    next();
});
exports.optionalAuth = optionalAuth;
