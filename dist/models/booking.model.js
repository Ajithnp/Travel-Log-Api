"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const booking_1 = require("../shared/constants/booking");
const TravelerSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    idType: {
        type: String,
        required: true,
        trim: true,
    },
    idNumber: {
        type: String,
        required: true,
        trim: true,
    },
    isLead: {
        type: Boolean,
        required: true,
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: null,
    },
    emailAddress: {
        type: String,
        trim: true,
        lowercase: true,
        default: null,
    },
    emergencyContact: {
        type: String,
        trim: true,
        default: null,
    },
    relation: {
        type: String,
        trim: true,
        default: null,
    },
}, { _id: false });
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Package', required: true },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SchedulePackage', required: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingCode: { type: String, required: true },
    groupType: {
        type: String,
        enum: Object.values(booking_1.GROUP_TYPE),
        required: true,
    },
    travelerCount: {
        type: Number,
        required: true,
        min: [1, 'Must have at least 1 traveler'],
        max: [6, 'Maximum 6 travelers per booking'],
    },
    travelers: {
        type: [TravelerSchema],
        required: true,
        validate: {
            validator: (arr) => arr.length >= 1 && arr.length <= 6,
            message: 'Travelers must be between 1 and 4 people',
        },
    },
    grossAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, default: 0, min: 0 },
    walletAmountUsed: { type: Number, required: true, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    platformCommission: { type: Number, required: true, min: 0 },
    vendorEarning: { type: Number, required: true, min: 0 },
    couponId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    offerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Offer', default: null },
    paymentStatus: {
        type: String,
        enum: Object.values(booking_1.PAYMENT_STATUS),
        default: booking_1.PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'wallet', 'combined'],
        default: null,
    },
    transactionId: { type: String, trim: true, default: null },
    bookingStatus: {
        type: String,
        enum: Object.values(booking_1.BOOKING_STATUS),
        default: booking_1.BOOKING_STATUS.PENDING,
    },
    cancellationReason: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationStatus: {
        type: String,
        enum: Object.values(booking_1.CANCELATION_STATUS),
        default: null,
    },
    cancelationRefundAmount: { type: Number, default: null },
    cancellationRejectedReason: { type: String, trim: true, default: null },
    isAttended: { type: Boolean, default: false },
    attendedAt: { type: Date, default: null },
    hasReviewed: { type: Boolean, default: false },
    ticketUrl: { type: String, default: null },
}, {
    timestamps: true,
    versionKey: false,
});
BookingSchema.index({ userId: 1, bookingStatus: 1, createdAt: -1 });
BookingSchema.index({ vendorId: 1, bookingStatus: 1, createdAt: -1 });
BookingSchema.index({ scheduleId: 1, bookingStatus: 1 });
BookingSchema.index({ userId: 1, scheduleId: 1 });
BookingSchema.index({ paymentStatus: 1 });
const Booking = mongoose_1.default.model('Booking', BookingSchema);
exports.default = Booking;
