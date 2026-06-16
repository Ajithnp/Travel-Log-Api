import { Schema, model } from 'mongoose';
import { IPayout } from '../types/entities/payout.entity';

const PayoutSchema = new Schema<IPayout>(
  {
    payoutRefId: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'SchedulePackage', required: true },
    bookingIds: [{ type: Schema.Types.ObjectId, ref: 'Booking', required: true }],

    grossAmount:      { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    netAmount:        { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    stripeTransferId: { type: String, default: null },
    failureReason:    { type: String, default: null },
    triggeredBy:      { type: String, enum: ['system', 'admin'], required: true },

    scheduledAt:  { type: Date, required: true },
    processedAt:  { type: Date, default: null },
  },
  { timestamps: true },
);

PayoutSchema.index({ vendorId: 1, status: 1 });
PayoutSchema.index({ scheduleId: 1 });
PayoutSchema.index({ stripeTransferId: 1 });

export const PayoutModel = model<IPayout>('Payout', PayoutSchema);