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
exports.RecommendationService = void 0;
const tsyringe_1 = require("tsyringe");
const user_preference_build_1 = require("../shared/utils/user-preference-build");
const vector_store_1 = require("../config/vector.store");
const cache_1 = require("../types/cache");
let RecommendationService = class RecommendationService {
    constructor(_aiProvider, _userPreferenceService, _cacheService) {
        this._aiProvider = _aiProvider;
        this._userPreferenceService = _userPreferenceService;
        this._cacheService = _cacheService;
    }
    getRecommendedPackages(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = cache_1.CACHE_KEYS.recommendedPackages(userId);
            const cached = yield this._cacheService.get(cacheKey);
            if (cached) {
                return cached;
            }
            // User data fetch
            const { bookings, wishlist } = yield this._userPreferenceService.fetchUserPreferences(userId);
            // Preference profile build
            const profile = (0, user_preference_build_1.buildPreferenceProfile)(bookings, wishlist);
            // AI preference summary
            const preferenceSummary = yield this._userPreferenceService.generatePreferenceSummary(profile);
            // Vector Search
            const vectorStore = yield (0, vector_store_1.getVectorStore)(this._aiProvider.getEmbeddingModel());
            const results = yield vectorStore.similaritySearch(preferenceSummary, 20);
            //Filter — exclude already booked trips
            const seenPackageIds = new Set();
            const filtered = results.filter((doc) => {
                var _a, _b;
                const packageId = (_b = (_a = doc.metadata) === null || _a === void 0 ? void 0 : _a.packageId) === null || _b === void 0 ? void 0 : _b.toString();
                if (seenPackageIds.has(packageId) || profile.bookedPackageIds.includes(packageId)) {
                    return false;
                }
                seenPackageIds.add(packageId);
                return true;
            });
            let finalResults = [...filtered];
            if (finalResults.length < 4) {
                const bookedResults = results.filter((doc) => {
                    var _a, _b;
                    const packageId = (_b = (_a = doc.metadata) === null || _a === void 0 ? void 0 : _a.packageId) === null || _b === void 0 ? void 0 : _b.toString();
                    return profile.bookedPackageIds.includes(packageId);
                });
                for (const doc of bookedResults) {
                    if (finalResults.length >= 4)
                        break;
                    finalResults.push(doc);
                }
            }
            //  Top 4 return
            const finalResultsSlice = finalResults.slice(0, 4).map((doc) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                return ({
                    _id: (_a = doc.metadata) === null || _a === void 0 ? void 0 : _a.packageId,
                    title: (_b = doc.metadata) === null || _b === void 0 ? void 0 : _b.title,
                    location: (_c = doc.metadata) === null || _c === void 0 ? void 0 : _c.location,
                    state: (_d = doc.metadata) === null || _d === void 0 ? void 0 : _d.state,
                    rating: Number((_e = doc.metadata) === null || _e === void 0 ? void 0 : _e.packageAverageRating) || 0,
                    totalReviews: Number((_f = doc.metadata) === null || _f === void 0 ? void 0 : _f.packageTotalReviews) || 0,
                    soloPrice: Number((_g = doc.metadata) === null || _g === void 0 ? void 0 : _g.minPrice) || 0,
                    category: (_h = doc.metadata) === null || _h === void 0 ? void 0 : _h.category,
                    image: { key: ((_j = doc.metadata) === null || _j === void 0 ? void 0 : _j.imageKey) || '' },
                });
            });
            yield this._cacheService.set(cacheKey, finalResultsSlice, cache_1.CACHE_TTL.ttl_30_minutes);
            return finalResultsSlice;
        });
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAIProvider')),
    __param(1, (0, tsyringe_1.inject)('IUserPreferenceService')),
    __param(2, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], RecommendationService);
