"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageModel = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../shared/constants/constants");
const FileSchema = new mongoose_1.Schema({
    key: { type: String },
}, { _id: false });
const activitySchema = new mongoose_1.Schema({
    startTime: { type: String },
    endTime: { type: String },
    title: { type: String },
    description: { type: String },
    location: { type: String },
    specials: { type: [String], default: [] },
    included: { type: Boolean },
}, { _id: false });
const itineraryDaySchema = new mongoose_1.Schema({
    title: { type: String },
    dayNumber: { type: Number },
    activities: { type: [activitySchema], default: [] },
}, { _id: false });
const packageSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: { type: String, trim: true },
    location: { type: String, trim: true },
    state: { type: String, trim: true },
    usp: { type: String, trim: true },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
    },
    difficultyLevel: {
        type: String,
        enum: ['Easy', 'Moderate', 'Challenging', 'Extreme'],
    },
    description: { type: String },
    days: { type: String },
    nights: { type: String },
    basePrice: { type: String },
    images: { type: [FileSchema], default: [] },
    itinerary: { type: [itineraryDaySchema], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    packingList: { type: [String], default: [] },
    cancellationPolicy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'CancellationPolicy',
    },
    status: {
        type: String,
        enum: Object.values(constants_1.PACKAGE_STATUS),
        default: constants_1.PACKAGE_STATUS.DRAFT,
        index: true,
    },
    averageRating: {
        type: Number,
        default: 0,
    },
    totalReviews: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.PackageModel = (0, mongoose_1.model)('Package', packageSchema);
