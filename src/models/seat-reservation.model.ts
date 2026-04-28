import mongoose, { Schema } from 'mongoose';
import { ISeatReservation } from '../types/entities/seat-reservation.entity';

const RESERVATION_TTL_SECONDS = 5 * 60; // 5 minutes

const SeatReservationSchema = new Schema<ISeatReservation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'SchedulePackage',
      required: true,
      index: true,
    },

    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },

    tierType: {
      type: String,
      enum: ['SOLO', 'DUO', 'GROUP'],
      required: true,
    },

    seatsCount: {
      type: Number,
      required: true,
      min: 1,
    },

    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'RELEASED', 'EXPIRED'],
      default: 'PENDING',
    },

    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + RESERVATION_TTL_SECONDS * 1000),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// TTL index: MongoDB removes documents automatically when expiresAt passes
SeatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

SeatReservationSchema.index({ userId: 1, status: 1 });

export const SeatReservationModel = mongoose.model<ISeatReservation>(
  'SeatReservation',
  SeatReservationSchema,
);
