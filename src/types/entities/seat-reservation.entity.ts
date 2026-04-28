import mongoose, { Document } from 'mongoose';
import { PricingType } from './schedule.entity';

export type SeatReservationStatus = 'PENDING' | 'CONFIRMED' | 'RELEASED' | 'EXPIRED';

export interface ISeatReservation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  tierType: PricingType;
  seatsCount: number;
  stripePaymentIntentId: string;
  status: SeatReservationStatus;
  /** MongoDB TTL index */
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
