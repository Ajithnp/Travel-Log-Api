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
exports.blacklistToken = void 0;
const redis_config_1 = __importDefault(require("../../config/redis.config"));
const small_hasher_helper_1 = require("./small.hasher.helper");
const tsyringe_1 = require("tsyringe");
const blacklistToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenService = tsyringe_1.container.resolve('ITokenService');
    const decodedToken = tokenService.decodeToken(token);
    if (!decodedToken || !decodedToken.exp) {
        return;
    }
    const exp = decodedToken.exp * 1000;
    const now = Date.now();
    const ttl = Math.floor((exp - now) / 1000);
    if (ttl <= 0)
        return;
    const tokenHash = (0, small_hasher_helper_1.smallHasher)(token);
    yield redis_config_1.default.set(`bl_token${tokenHash}`, 'true', { EX: ttl });
});
exports.blacklistToken = blacklistToken;
