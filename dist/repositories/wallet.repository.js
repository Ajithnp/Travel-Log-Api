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
exports.WalletRepository = void 0;
const wallet_model_1 = require("../models/wallet.model");
const base_repository_1 = require("./base.repository");
class WalletRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(wallet_model_1.Wallet);
    }
    getBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.findOne({ userId });
            return (wallet === null || wallet === void 0 ? void 0 : wallet.balance) || 0;
        });
    }
    createWallet(userId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const [wallet] = yield this.model.create([{ userId, balance: 0 }], { session });
            return wallet;
        });
    }
    findWalletByUserId(userId, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.model.findOne({ userId }).session(session || null);
            return wallet;
        });
    }
    incrementBalance(userId, amount, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOneAndUpdate({ userId }, { $inc: { balance: amount } }, { session, new: true, runValidators: true });
        });
    }
    decrementBalance(userId, amount, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findOneAndUpdate({ userId, balance: { $gte: amount } }, { $inc: { balance: -amount } }, { session, new: true, runValidators: true });
        });
    }
}
exports.WalletRepository = WalletRepository;
