"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCookies = void 0;
const parseCookies = (cookieHeader) => {
    return cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value)
            acc[key.trim()] = decodeURIComponent(value.trim());
        return acc;
    }, {});
};
exports.parseCookies = parseCookies;
