"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactLimiter = exports.wishlistToggleLimiter = exports.searchLimiter = exports.otpLimiter = exports.loginLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_config_1 = __importDefault(require("./redis.config"));
exports.loginLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_config_1.default,
    points: 5,
    duration: 60,
    blockDuration: 300,
});
exports.otpLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_config_1.default,
    points: 3, // Max 3 requests allowed
    duration: 600, // In 600 seconds (10 minutes)
    blockDuration: 600, // If limit exceeded, block for 10 minutes
});
exports.searchLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_config_1.default,
    points: 20,
    duration: 60,
});
exports.wishlistToggleLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_config_1.default,
    points: 30, // 30 toggles allowed
    duration: 60, // per 60 seconds
    blockDuration: 60, // block for 60 seconds
    useRedisPackage: true,
});
exports.contactLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_config_1.default,
    points: 10,
    duration: 60,
    blockDuration: 600,
    useRedisPackage: true,
});
