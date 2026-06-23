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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenBlackListService = void 0;
const tsyringe_1 = require("tsyringe");
const small_hasher_helper_1 = require("../shared/utils/small.hasher.helper");
let TokenBlackListService = class TokenBlackListService {
    constructor(_cacheService) {
        this._cacheService = _cacheService;
    }
    blackListToken(token, tokenExp) {
        return __awaiter(this, void 0, void 0, function* () {
            const ttl = Number(tokenExp) - Math.floor(Date.now() / 1000);
            if (ttl <= 0)
                return; // prevent storing expired token;
            const tokenHash = (0, small_hasher_helper_1.smallHasher)(token); // Don't store raw token in redis;
            yield this._cacheService.set(`bl_token:${tokenHash}`, 'true', ttl);
        });
    }
    isBlackListed(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenHash = (0, small_hasher_helper_1.smallHasher)(token);
            const exists = yield this._cacheService.exists(`bl_token:${tokenHash}`);
            return exists === 1;
        });
    }
};
exports.TokenBlackListService = TokenBlackListService;
exports.TokenBlackListService = TokenBlackListService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object])
], TokenBlackListService);
