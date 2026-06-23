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
exports.UserRewardService = void 0;
const tsyringe_1 = require("tsyringe");
const AppError_1 = require("../../errors/AppError");
const constants_1 = require("../../shared/constants/constants");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const messages_1 = require("../../shared/constants/messages");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
const wallet_1 = require("../../shared/constants/wallet");
let UserRewardService = class UserRewardService {
    constructor(_rewardRepository, _couponRepository, _walletRepository, _walletTransactionRepository) {
        this._rewardRepository = _rewardRepository;
        this._couponRepository = _couponRepository;
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
    }
    toResponse(reward) {
        return {
            title: reward.templateId.title,
            rewardValue: reward.templateId.rewardValue,
            id: reward._id.toString(),
        };
    }
    getUnrevealedReward(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reward = yield this._rewardRepository.findRewardByUserId(userId);
            return reward ? this.toResponse(reward) : null;
        });
    }
    revealReward(rewardId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reward = yield this._rewardRepository.findOne({
                _id: (0, objectId_helper_1.toObjectId)(rewardId),
                userId: (0, objectId_helper_1.toObjectId)(userId),
            });
            if (!reward) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REWARD_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            if (reward.status === constants_1.USER_REWARD_STATUS.REVEALED) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.REWARD_ALREADY_USED, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            const coupon = yield this._couponRepository.findById(reward.templateId.toString());
            if (!coupon) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.COUPON_NOT_FOUND, http_status_code_1.HTTP_STATUS.NOT_FOUND);
            }
            yield this._rewardRepository.findOneAndUpdate({ _id: (0, objectId_helper_1.toObjectId)(rewardId) }, { status: constants_1.USER_REWARD_STATUS.REVEALED });
            let wallet = yield this._walletRepository.findWalletByUserId(userId);
            if (!wallet) {
                wallet = yield this._walletRepository.createWallet(userId);
            }
            if (!wallet) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, http_status_code_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            this._walletRepository.incrementBalance(userId, coupon.rewardValue);
            this._walletTransactionRepository.createTransaction({
                walletId: wallet._id,
                userId: (0, objectId_helper_1.toObjectId)(userId),
                amount: coupon.rewardValue,
                description: 'Reward(cashback) credited',
                type: wallet_1.TRANSACTION_TYPE.CREDIT,
                status: wallet_1.TRANSACTION_STATUS.SUCCESS,
            });
        });
    }
};
exports.UserRewardService = UserRewardService;
exports.UserRewardService = UserRewardService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRewardRepository')),
    __param(1, (0, tsyringe_1.inject)('ICouponRepository')),
    __param(2, (0, tsyringe_1.inject)('IWalletRepository')),
    __param(3, (0, tsyringe_1.inject)('IWalletTransactionRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserRewardService);
