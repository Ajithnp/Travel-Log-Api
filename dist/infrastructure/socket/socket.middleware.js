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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const di_tokens_1 = require("../../shared/constants/di.tokens");
const jwt_token_1 = require("../../shared/constants/jwt.token");
const logger_1 = __importDefault(require("../../config/logger"));
const cookie_1 = require("cookie");
const socketAuthMiddleware = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const rawCookies = (_b = (_a = socket.handshake.headers) === null || _a === void 0 ? void 0 : _a.cookie) !== null && _b !== void 0 ? _b : '';
        const parsedCookies = (0, cookie_1.parse)(rawCookies);
        const token = parsedCookies[jwt_token_1.JWT_TOKEN.ACCESS_TOKEN] || ((_c = socket.handshake.auth) === null || _c === void 0 ? void 0 : _c[jwt_token_1.JWT_TOKEN.ACCESS_TOKEN]);
        if (!token) {
            return next(new Error('AUTH_ERROR: Access token missing'));
        }
        const tokenService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_SERVICE);
        const decoded = tokenService.verifyAccessToken(token);
        if (!decoded) {
            return next(new Error('AUTH_ERROR: Invalid token'));
        }
        const tokenBlackListService = tsyringe_1.container.resolve(di_tokens_1.SERVICE_TOKENS.TOKEN_BLACKLIST);
        const isBlackListed = yield tokenBlackListService.isBlackListed(token);
        if (isBlackListed) {
            return next(new Error('AUTH_ERROR: Session expired'));
        }
        const userRepository = tsyringe_1.container.resolve(di_tokens_1.REPOSITORY_TOKENS.USER_REPOSITORY);
        const user = yield userRepository.findOne({ email: decoded.email });
        if (!user) {
            return next(new Error('AUTH_ERROR: User not found'));
        }
        if (user.isBlocked) {
            return next(new Error('AUTH_ERROR: Account is blocked'));
        }
        socket.data.userId = (_d = decoded.userId) !== null && _d !== void 0 ? _d : user._id.toString();
        socket.data.role = decoded.role;
        logger_1.default.info(`[Socket Auth] Authenticated: userId=${socket.data.userId} role=${socket.data.role}`);
        next(); // allow connection
    }
    catch (error) {
        logger_1.default.error('[Socket Auth] Middleware error', error);
        next(new Error('AUTH_ERROR: Unexpected error during authentication'));
    }
});
exports.socketAuthMiddleware = socketAuthMiddleware;
