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
exports.WishlistService = void 0;
const tsyringe_1 = require("tsyringe");
const constants_1 = require("../../shared/constants/constants");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const cache_1 = require("../../types/cache");
const wishlist_mapper_1 = require("../../shared/mappers/wishlist.mapper");
let WishlistService = class WishlistService {
    constructor(_wishlistRepository, _packageRepository, _cacheService) {
        this._wishlistRepository = _wishlistRepository;
        this._packageRepository = _packageRepository;
        this._cacheService = _cacheService;
    }
    invalidateUserWishlistCache(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._cacheService.clearPrefix(`wishlist:full:${userId}`);
            yield this._cacheService.clearPrefix(`wishlist:ids:${userId}`);
            yield this._cacheService.clearPrefix(`wishlist:count:${userId}`);
        });
    }
    toggleWishlist(userId, packageId) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkg = yield this._packageRepository.findById(packageId);
            if (!pkg) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (!pkg.isActive || pkg.status !== constants_1.PACKAGE_STATUS.PUBLISHED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.PACKAGE_NOT_AVAILABLE, http_status_code_1.HTTP_STATUS.FORBIDDEN);
            }
            const alreadyWishlisted = yield this._wishlistRepository.isPackageWishlisted(userId, packageId);
            if (alreadyWishlisted) {
                yield this._wishlistRepository.removePackage(userId, packageId);
            }
            else {
                yield this._wishlistRepository.addPackage(userId, packageId);
            }
            yield this.invalidateUserWishlistCache(userId);
            return { wishlisted: !alreadyWishlisted, packageId };
        });
    }
    getWishlistedIds(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const cacheKey = cache_1.CACHE_KEYS.wishlistedIds(userId);
            const cached = yield this._cacheService.get(cacheKey);
            if (cached)
                return { wishlistedPackageIds: cached };
            const doc = yield this._wishlistRepository.findWishlistedIds(userId);
            const ids = (_b = (_a = doc === null || doc === void 0 ? void 0 : doc.packages) === null || _a === void 0 ? void 0 : _a.map((id) => id.toString())) !== null && _b !== void 0 ? _b : [];
            yield this._cacheService.set(cacheKey, ids, cache_1.CACHE_TTL.ids);
            return { wishlistedPackageIds: ids };
        });
    }
    getWishlist(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = cache_1.CACHE_KEYS.wishlistFull(userId, page);
            const cached = yield this._cacheService.get(cacheKey);
            if (cached)
                return cached;
            const doc = yield this._wishlistRepository.findWithPopulatedPackages(userId, page, limit);
            if (!doc || !doc.packages || doc.packages.length === 0) {
                return {
                    data: [],
                    page,
                    totalPages: 0,
                    totalCount: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                };
            }
            const result = wishlist_mapper_1.WishlistMapper.toWishlistResponse(doc.packages, page, Math.ceil(doc.totalCount / limit), doc.totalCount, doc.hasNextPage);
            yield this._cacheService.set(cacheKey, result, cache_1.CACHE_TTL.full);
            return result;
        });
    }
    getWishlistCount(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = cache_1.CACHE_KEYS.wishlistCount(userId);
            const cached = yield this._cacheService.get(cacheKey);
            if (cached !== null)
                return cached;
            const count = yield this._wishlistRepository.countPackages(userId);
            yield this._cacheService.set(cacheKey, count, cache_1.CACHE_TTL.count);
            return count;
        });
    }
};
exports.WishlistService = WishlistService;
exports.WishlistService = WishlistService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IWishlistRepository')),
    __param(1, (0, tsyringe_1.inject)('IBasePackageRepository')),
    __param(2, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], WishlistService);
