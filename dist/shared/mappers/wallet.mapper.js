"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletMapper = void 0;
class WalletMapper {
    static toTransactionDTO(transaction) {
        var _a;
        return {
            id: transaction._id.toString(),
            type: transaction.type,
            status: transaction.status,
            amount: transaction.amount.toFixed(2),
            description: transaction.description,
            referenceId: (_a = transaction.referenceId) !== null && _a !== void 0 ? _a : '',
            createdAt: transaction.createdAt.toISOString(),
        };
    }
    static toTransactionDTOList(transactions) {
        return transactions.map(this.toTransactionDTO);
    }
}
exports.WalletMapper = WalletMapper;
