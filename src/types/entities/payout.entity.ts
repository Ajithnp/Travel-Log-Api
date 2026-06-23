import mongoose, { Document, Types } from 'mongoose';
import { PAYOUT_STATUS } from '../../shared/constants/constants';

export type PayoutStatus = (typeof PAYOUT_STATUS)[keyof typeof PAYOUT_STATUS];

export interface IPayout extends Document {
  _id: mongoose.Types.ObjectId;
  payoutRefId: string;
  vendorId: Types.ObjectId;
  scheduleId: Types.ObjectId;
  bookingIds: Types.ObjectId[];
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: PayoutStatus;
  stripeTransferId: string | null;
  failureReason: string | null;
  triggeredBy: 'system' | 'admin';
  scheduledAt: Date;
  processedAt: Date | null;
  createdAt: Date;
}
