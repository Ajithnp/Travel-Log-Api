"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletTransaction = void 0;
const mongoose_1 = require("mongoose");
const walletTransactionSchema = new mongoose_1.Schema({
    walletId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: false,
    },
    type: {
        type: String,
        required: true,
        enum: ['credit', 'debit'],
    },
    amount: {
        type: Number,
        required: true,
        min: [0.01, 'Transaction amount must be greater than zero'],
    },
    status: {
        type: String,
        required: true,
        enum: ['success', 'failed', 'pending'],
        default: 'success',
    },
    description: {
        type: String,
        required: true, // Example: "Refund for booking #12345" or "Payment for booking #67890"
    },
    referenceId: {
        type: String,
        required: false,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
exports.WalletTransaction = (0, mongoose_1.model)('WalletTransaction', walletTransactionSchema);
