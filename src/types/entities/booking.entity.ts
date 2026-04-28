import mongoose, { Document, Schema } from 'mongoose';
import { BOOKING_STATUS, CANCELLED_BY, GROUP_TYPE, PAYMENT_STATUS } from 'shared/constants/booking';

export type GroupType = (typeof GROUP_TYPE)[keyof typeof GROUP_TYPE];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type CancelledBy = (typeof CANCELLED_BY)[keyof typeof CANCELLED_BY];

export interface ITraveler {
  fullName: string;
  idType: string;
  idNumber: string;
  isLead: boolean;
  phoneNumber?: string;
  emailAddress?: string;
  emergencyContact?: string;
  relation?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  // Core references
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;

  // Booking details
  groupType: GroupType;
  travelerCount: number;
  travelers: ITraveler[];

  // Financials — all calculated at booking time and stored
  grossAmount: number; // pricing[groupType] from schedule at time of booking
  discountAmount: number; // offer + coupon combined (0 until M54/M56)
  walletAmountUsed: number; // wallet balance applied (0 until M27/M28)
  finalAmount: number; // grossAmount - discountAmount - walletAmountUsed
  platformCommission: number; // 15% of grossAmount
  vendorEarning: number; // grossAmount - platformCommission

  // Optional discount references (null until Phase 4)
  couponId?: mongoose.Types.ObjectId | null;
  offerId?: mongoose.Types.ObjectId | null;

  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: 'stripe' | 'wallet' | 'combined' | null;
  transactionId?: string | null; // Stripe PaymentIntent ID or Wallet Transaction ID

  // Booking lifecycle
  bookingStatus: BookingStatus;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: CancelledBy;

  // Post-trip
  isAttended: boolean;
  attendedAt?: Date;
  hasReviewed: boolean;
  ticketUrl?: string; // s3 URL of PDF ticket (M22)

  // Seat hold — null after payment completes
  seatHoldExpiry?: Date;

  createdAt: Date;
  updatedAt: Date;
}
