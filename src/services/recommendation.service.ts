import { inject, injectable } from "tsyringe";
import { IRecommendationService } from "../interfaces/service_interfaces/IRecommendationService";
import { IAIProvider } from "../infrastructure/ai-integration/IAiIntegartion";
import { IUserPreferenceService } from "../interfaces/service_interfaces/user/IPreferenceService";
import { buildPreferenceProfile } from "../shared/utils/user-preference-build";
import { getVectorStore } from "../config/vector.store";
import { RecommendedPackagesResponseDTO } from "../interfaces/service_interfaces/user/IPublicPackageService";
import { ICacheService } from "../interfaces/service_interfaces/ICacheService";
import { CACHE_KEYS, CACHE_TTL } from "../types/cache";

@injectable()
export class RecommendationService implements IRecommendationService {
    constructor(
        @inject('IAIProvider')
        private _aiProvider: IAIProvider,
        @inject('IUserPreferenceService')
        private _userPreferenceService: IUserPreferenceService,
        @inject('ICacheService')
        private _cacheService: ICacheService
    ) { }

    async getRecommendedPackages(userId: string): Promise<RecommendedPackagesResponseDTO[]> {
        const cacheKey = CACHE_KEYS.recommendedPackages(userId);
        const cached = await this._cacheService.get<RecommendedPackagesResponseDTO[]>(cacheKey);
        if (cached) {
            return cached;
        }

        // User data fetch
        const { bookings, wishlist } = await this._userPreferenceService.fetchUserPreferences(userId);

        // Preference profile build
        const profile = buildPreferenceProfile(bookings, wishlist);

        // AI preference summary
        const preferenceSummary = await this._userPreferenceService.generatePreferenceSummary(profile);

        // Vector Search
        const vectorStore = await getVectorStore(this._aiProvider.getEmbeddingModel());
        const results = await vectorStore.similaritySearch(preferenceSummary, 20);

        //Filter — exclude already booked trips
        const seenPackageIds = new Set<string>();
        const filtered = results.filter((doc) => {
            const packageId = doc.metadata?.packageId?.toString();
            if (seenPackageIds.has(packageId) || profile.bookedPackageIds.includes(packageId)) {
                return false;
            }
            seenPackageIds.add(packageId);
            return true;
        });

        let finalResults = [...filtered];

        if (finalResults.length < 4) {
            const bookedResults = results.filter((doc) => {
                const packageId = doc.metadata?.packageId?.toString();
                return profile.bookedPackageIds.includes(packageId);
            });

            for (const doc of bookedResults) {
                if (finalResults.length >= 4) break;
                finalResults.push(doc);
            }
        }

        //  Top 4 return
        const finalResultsSlice = finalResults.slice(0, 4).map((doc) => ({
            _id: doc.metadata?.packageId,
            title: doc.metadata?.title,
            location: doc.metadata?.location,
            state: doc.metadata?.state,
            rating: Number(doc.metadata?.packageAverageRating) || 0,
            totalReviews: Number(doc.metadata?.packageTotalReviews) || 0,
            soloPrice: Number(doc.metadata?.minPrice) || 0,
            category: doc.metadata?.category,
            image: { key: doc.metadata?.imageKey || '' }
        })as RecommendedPackagesResponseDTO);

        await this._cacheService.set(cacheKey, finalResultsSlice, CACHE_TTL.ttl_30_minutes);

        return finalResultsSlice;
    }

}