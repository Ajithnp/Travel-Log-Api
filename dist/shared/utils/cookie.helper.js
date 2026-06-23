"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAuthCookies = exports.setAuthCookies = void 0;
const isProduction = process.env.NODE_ENV === 'production';
const setAuthCookies = (res, key, value, maxAge) => {
    res.cookie(key, value, {
        httpOnly: true,
        secure: isProduction, //  secure cookies in production
        sameSite: isProduction ? 'none' : 'lax',
        maxAge,
    });
};
exports.setAuthCookies = setAuthCookies;
const clearAuthCookies = (res, key) => {
    res.clearCookie(key, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 0, // immediately expires the cookie
    });
};
exports.clearAuthCookies = clearAuthCookies;
