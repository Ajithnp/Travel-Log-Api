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
exports.WalletTransactionRepository = void 0;
const base_repository_1 = require("./base.repository");
const mongoose_1 = require("mongoose");
const wallet_tansaction_model_1 = require("../models/wallet-tansaction.model");
const wallet_1 = require("../shared/constants/wallet");
class WalletTransactionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(wallet_tansaction_model_1.WalletTransaction);
    }
    createTransaction(transaction, session) {
        return __awaiter(this, void 0, void 0, function* () {
            const [createdTransaction] = yield this.model.create([transaction], { session });
            return createdTransaction;
        });
    }
    updateTransactionStatus(transactionId, status, session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.findByIdAndUpdate(transactionId, { $set: { status } }, { session, new: true, runValidators: true });
        });
    }
    findTransactionsByUserId(userId, filter, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { userId };
            if (filter === wallet_1.TRANSACTION_TYPE.CREDIT) {
                query.type = wallet_1.TRANSACTION_TYPE.CREDIT;
            }
            else if (filter === wallet_1.TRANSACTION_TYPE.DEBIT) {
                query.type = wallet_1.TRANSACTION_TYPE.DEBIT;
            }
            else if (filter === 'all') {
                query.type = { $in: [wallet_1.TRANSACTION_TYPE.CREDIT, wallet_1.TRANSACTION_TYPE.DEBIT] };
            }
            const skip = (page - 1) * limit;
            const [transactions, totalDocs] = yield Promise.all([
                this.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                this.model.countDocuments(query),
            ]);
            return { transactions: transactions, totalDocs };
        });
    }
    calculateTotalAmountByType(userId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.model.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId), type, status: { $ne: 'failed' } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]);
            return result.length > 0 ? result[0].total : 0;
        });
    }
}
exports.WalletTransactionRepository = WalletTransactionRepository;
