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
exports.WalletService = void 0;
const tsyringe_1 = require("tsyringe");
const wallet_1 = require("../../shared/constants/wallet");
const wallet_mapper_1 = require("../../shared/mappers/wallet.mapper");
const AppError_1 = require("../../errors/AppError");
const messages_1 = require("../../shared/constants/messages");
const http_status_code_1 = require("../../shared/constants/http_status_code");
const objectId_helper_1 = require("../../shared/utils/database/objectId.helper");
let WalletService = class WalletService {
    constructor(_walletRepository, _walletTransactionRepository, _userRewardRepository) {
        this._walletRepository = _walletRepository;
        this._walletTransactionRepository = _walletTransactionRepository;
        this._userRewardRepository = _userRewardRepository;
    }
    getWalletDetails(userId, filter, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield this._walletRepository.findWalletByUserId(userId);
            if (!wallet) {
                wallet = yield this._walletRepository.createWallet(userId);
            }
            const balance = wallet.balance || 0;
            const [totalCredit, totalDebit, totalReward, paginatedResult] = yield Promise.all([
                this._walletTransactionRepository.calculateTotalAmountByType(userId, wallet_1.TRANSACTION_TYPE.CREDIT),
                this._walletTransactionRepository.calculateTotalAmountByType(userId, wallet_1.TRANSACTION_TYPE.DEBIT),
                this._userRewardRepository.getRewardAmountByUserId(userId),
                this._walletTransactionRepository.findTransactionsByUserId(userId, filter, page, limit),
            ]);
            return {
                balance,
                totalCredit,
                totalDebit,
                totalReward,
                transactions: {
                    data: wallet_mapper_1.WalletMapper.toTransactionDTOList(paginatedResult.transactions),
                    currentPage: page,
                    totalPages: Math.ceil(paginatedResult.totalDocs / limit),
                    totalDocs: paginatedResult.totalDocs,
                },
            };
        });
    }
    getWalletBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield this._walletRepository.findWalletByUserId(userId);
            if (!wallet) {
                wallet = yield this._walletRepository.createWallet(userId);
            }
            return { balance: wallet.balance || 0 };
        });
    }
    deductBalance(userId, amount, description, session, referenceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this._walletRepository.findWalletByUserId(userId, session);
            if (!wallet) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.WALLET_NOT_FOUND, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (wallet.balance < amount) {
                throw new AppError_1.AppError(messages_1.ERROR_MESSAGES.INSUFFICIENT_WALLET_BALANCE, http_status_code_1.HTTP_STATUS.BAD_REQUEST);
            }
            yield this._walletRepository.decrementBalance(userId, amount, session);
            yield this._walletTransactionRepository.createTransaction({
                walletId: wallet._id,
                userId: (0, objectId_helper_1.toObjectId)(userId),
                type: wallet_1.TRANSACTION_TYPE.DEBIT,
                amount,
                description,
                referenceId,
                status: 'success',
            }, session);
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IWalletRepository')),
    __param(1, (0, tsyringe_1.inject)('IWalletTransactionRepository')),
    __param(2, (0, tsyringe_1.inject)('IUserRewardRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], WalletService);
