"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT_TOKEN = void 0;
exports.JWT_TOKEN = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    ACCESS_TOKEN_COOKIE_EXPIRY: 15 * 60 * 1000,
    REFRESH_TOKEN_COOKIE_EXPIRY: 7 * 24 * 60 * 60 * 1000,
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
};
