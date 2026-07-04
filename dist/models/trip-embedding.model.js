"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripEmbeddingModel = void 0;
const mongoose_1 = require("mongoose");
const TripEmbeddingSchema = new mongoose_1.Schema({
    scheduleId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SchedulePackage',
        required: true,
        unique: true, // one schedule -one embedding
    },
    packageId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    combinedText: {
        type: String,
        required: true,
    },
    embedding: {
        type: [Number],
        required: true,
    },
    imageKey: { type: String, default: null },
    // Filter fields
    location: { type: String },
    state: { type: String },
    title: { type: String },
    minPrice: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    seatsAvailable: { type: Number },
    difficultyLevel: { type: String },
    category: { type: String },
    days: { type: String },
    nights: { type: String },
    packageAverageRating: { type: Number, default: 0 },
    packageTotalReviews: { type: Number, default: 0 },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
}, { timestamps: true });
exports.TripEmbeddingModel = (0, mongoose_1.model)('TripEmbedding', TripEmbeddingSchema);
