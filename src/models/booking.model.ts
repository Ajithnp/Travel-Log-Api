import mongoose, { Schema } from 'mongoose';
import { IBooking, ITraveler } from '../types/entities/booking.entity';
import { BOOKING_STATUS, CANCELLED_BY, GROUP_TYPE, PAYMENT_STATUS } from '../shared/constants/booking';

const TravelerSchema = new Schema<ITraveler>(
  {
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
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
  
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: 'SchedulePackage', required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    bookingCode: {type: String, required:true},
    groupType: {
      type: String,
      enum: Object.values(GROUP_TYPE),
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
        validator: (arr: ITraveler[]) => arr.length >= 1 && arr.length <= 6,
        message: 'Travelers must be between 1 and 4 people',
      },
    },

    grossAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, required: true, default: 0, min: 0 },
    walletAmountUsed: { type: Number, required: true, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    platformCommission: { type: Number, required: true, min: 0 },
    vendorEarning: { type: Number, required: true, min: 0 },

    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer', default: null },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'wallet', 'combined'],
      default: null,
    },
    transactionId: { type: String, trim: true, default: null },
    bookingStatus: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    cancellationReason: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: Object.values(CANCELLED_BY),
      default: null,
    },

    isAttended: { type: Boolean, default: false },
    attendedAt: { type: Date, default: null },
    hasReviewed: { type: Boolean, default: false },
    ticketUrl: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

BookingSchema.index({ userId: 1, bookingStatus: 1, createdAt: -1 });
BookingSchema.index({ vendorId: 1, bookingStatus: 1, createdAt: -1 });
BookingSchema.index({ scheduleId: 1, bookingStatus: 1 });
BookingSchema.index({ userId: 1, scheduleId: 1 });
BookingSchema.index({ paymentStatus: 1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
