import { inject, injectable } from "tsyringe";
import { AppError } from "../../errors/AppError";
import { IAIProvider } from "../../infrastructure/ai-integration/IAiIntegartion";
import { IBookingRepository } from "../../interfaces/repository_interfaces/IBookingRepository";
import { IUserRepository } from "../../interfaces/repository_interfaces/IUserRepository";
import { IWishlistRepository } from "../../interfaces/repository_interfaces/IWishlistRepository";
import { FetchUserPreferencesResult, IUserPreferenceService } from "../../interfaces/service_interfaces/user/IPreferenceService";
import { PreferenceProfile } from "../../shared/utils/user-preference-build";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { ERROR_MESSAGES } from "../../shared/constants/messages";
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { NEW_USER_PACKAGES_RECOMMENDATION_PROMPT, PREFERENCE_SUMMARY_PROMPT, PREFERENCE_SUMMARY_SYSTEM_PROMPT } from "../../shared/templates/prompt_templates";

@injectable()
export class UserPreferenceService implements IUserPreferenceService {
    constructor(
        @inject('IAIProvider')
        private _aiProvider: IAIProvider,
        @inject('IUserRepository')
        private _userRepository: IUserRepository,
        @inject('IBookingRepository')
        private _bookingRepository: IBookingRepository,
        @inject('IWishlistRepository')
        private _wishlistRepository: IWishlistRepository
    ) { }

    async fetchUserPreferences(userId: string): Promise<FetchUserPreferencesResult> {

        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
        }

        const [bookings, wishlist] = await Promise.all([
            this._bookingRepository.getRecentFiveBookings(userId),
            this._wishlistRepository.getWishlistPackages(userId)
        ]);

        return { bookings, wishlist };
    };

    async generatePreferenceSummary(profile: PreferenceProfile): Promise<string> {

        if (!profile.hasHistory && !profile.hasWishlist) {
            return NEW_USER_PACKAGES_RECOMMENDATION_PROMPT
        }

        const prompt = ChatPromptTemplate.fromMessages([
            [
                'system',
                PREFERENCE_SUMMARY_SYSTEM_PROMPT,
            ],
            [
                'human',
                PREFERENCE_SUMMARY_PROMPT,
            ],
        ]);

        const chain = prompt.pipe(this._aiProvider.getChatModel()).pipe(new StringOutputParser());

        const summary = await chain.invoke({
            bookedLocations: profile.bookedLocations.join(', ') || 'various',
            bookedStates: profile.bookedStates.join(', ') || 'various',
            wishlistLocations: profile.wishlistLocations.join(', ') || 'none',
            wishlistStates: profile.wishlistStates.join(', ') || 'none',
            difficulties: profile.difficulties.join(', ') || 'any',
            travelStyle: profile.travelStyle || '',
            avgBudget: profile.avgBudget || 0,
        });

        return summary;
    }

}