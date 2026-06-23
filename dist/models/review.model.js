"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
const FileSchema = new mongoose_1.Schema({
    key: { type: String, default: null },
}, { _id: false });
const reviewSchema = new mongoose_1.Schema({
    userId: {
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
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    text: {
        type: String,
        required: true,
        trim: true,
    },
    images: {
        type: [FileSchema],
        default: [],
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.ReviewModel = (0, mongoose_1.model)('Review', reviewSchema);
reviewSchema.index({ packageId: 1, isDeleted: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, isDeleted: 1 });
reviewSchema.index({ vendorId: 1, isDeleted: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
