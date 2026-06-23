"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModel = void 0;
const mongoose_1 = require("mongoose");
const offerSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    packageId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
        index: true,
    },
    scheduleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SchedulePackage',
        default: null,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    discountType: {
        type: String,
        enum: ['percentage'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
    },
    usageLimit: {
        type: Number,
        default: null,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    validFrom: {
        type: Date,
        required: true,
        default: new Date(),
    },
    validUntil: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, { timestamps: true });
exports.OfferModel = (0, mongoose_1.model)('Offer', offerSchema);
