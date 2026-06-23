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
exports.makeRateLimiter = makeRateLimiter;
const http_status_code_1 = require("../shared/constants/http_status_code");
const messages_1 = require("../shared/constants/messages");
function makeRateLimiter(limiter, keyFrom = 'ip') {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const key = keyFrom === 'userId' ? ((_c = (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : req.ip) !== null && _c !== void 0 ? _c : 'anonymous') : ((_d = req.ip) !== null && _d !== void 0 ? _d : 'unknown');
        try {
            yield limiter.consume(key);
            next();
        }
        catch (rejRes) {
            const rateLimitRes = rejRes;
            res.set('Retry-After', Math.ceil(rateLimitRes.msBeforeNext / 1000).toString());
            res.status(http_status_code_1.HTTP_STATUS.TOO_MANY_REQUESTS).json({ message: messages_1.ERROR_MESSAGES.TOO_MANY_REQUESTS });
        }
    });
}
