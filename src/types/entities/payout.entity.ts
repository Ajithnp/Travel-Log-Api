import { Document, ObjectId } from 'mongoose';

export interface IPayout extends Document {
  _id: ObjectId;
  vendorId: ObjectId;
  scheduleId: ObjectId;
  bookingIds: ObjectId[];
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripeTransferId: string | null;
  failureReason: string | null;
  triggeredBy: 'system' | 'admin';
  scheduledAt: Date;
  processedAt: Date | null;
  createdAt: Date;
}