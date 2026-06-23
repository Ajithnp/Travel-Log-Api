"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayoutModel = void 0;
const mongoose_1 = require("mongoose");
const PayoutSchema = new mongoose_1.Schema({
    payoutRefId: { type: String, required: true },
    vendorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'SchedulePackage', required: true },
    bookingIds: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Booking', required: true }],
    grossAmount: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    netAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
    },
    stripeTransferId: { type: String, default: null },
    failureReason: { type: String, default: null },
    triggeredBy: { type: String, enum: ['system', 'admin'], required: true },
    scheduledAt: { type: Date, required: true },
    processedAt: { type: Date, default: null },
}, { timestamps: true });
PayoutSchema.index({ vendorId: 1, status: 1 });
PayoutSchema.index({ scheduleId: 1 });
PayoutSchema.index({ stripeTransferId: 1 });
exports.PayoutModel = (0, mongoose_1.model)('Payout', PayoutSchema);
