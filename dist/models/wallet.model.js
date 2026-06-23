"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Wallet balance cannot be negative'],
    },
    currency: {
        type: String,
        required: true,
        default: 'INR',
        uppercase: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
}, { timestamps: true });
exports.Wallet = (0, mongoose_1.model)('Wallet', walletSchema);
