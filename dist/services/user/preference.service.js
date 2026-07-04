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
exports.UserPreferenceService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const output_parsers_1 = require("@langchain/core/output_parsers");
const prompts_1 = require("@langchain/core/prompts");
const prompt_templates_1 = require("../../shared/templates/prompt_templates");
let UserPreferenceService = class UserPreferenceService {
    constructor(_aiProvider, _userRepository, _bookingRepository, _wishlistRepository) {
        this._aiProvider = _aiProvider;
        this._userRepository = _userRepository;
        this._bookingRepository = _bookingRepository;
        this._wishlistRepository = _wishlistRepository;
    }
    fetchUserPreferences(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(userId);
            if (!user) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.USER_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            const [bookings, wishlist] = yield Promise.all([
                this._bookingRepository.getRecentFiveBookings(userId),
                this._wishlistRepository.getWishlistPackages(userId),
            ]);
            return { bookings, wishlist };
        });
    }
    generatePreferenceSummary(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!profile.hasHistory && !profile.hasWishlist) {
                return prompt_templates_1.NEW_USER_PACKAGES_RECOMMENDATION_PROMPT;
            }
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
                ['system', prompt_templates_1.PREFERENCE_SUMMARY_SYSTEM_PROMPT],
                ['human', prompt_templates_1.PREFERENCE_SUMMARY_PROMPT],
            ]);
            const chain = prompt.pipe(this._aiProvider.getChatModel()).pipe(new output_parsers_1.StringOutputParser());
            const summary = yield chain.invoke({
                bookedLocations: profile.bookedLocations.join(', ') || 'various',
                bookedStates: profile.bookedStates.join(', ') || 'various',
                wishlistLocations: profile.wishlistLocations.join(', ') || 'none',
                wishlistStates: profile.wishlistStates.join(', ') || 'none',
                difficulties: profile.difficulties.join(', ') || 'any',
                travelStyle: profile.travelStyle || '',
                avgBudget: profile.avgBudget || 0,
            });
            return summary;
        });
    }
};
exports.UserPreferenceService = UserPreferenceService;
exports.UserPreferenceService = UserPreferenceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAIProvider')),
    __param(1, (0, tsyringe_1.inject)('IUserRepository')),
    __param(2, (0, tsyringe_1.inject)('IBookingRepository')),
    __param(3, (0, tsyringe_1.inject)('IWishlistRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserPreferenceService);
