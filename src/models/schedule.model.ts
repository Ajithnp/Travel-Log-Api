import mongoose, { Schema } from 'mongoose';
import { SCHEDULE_STATUS } from '../shared/constants/constants';
import { ISchedule } from '../types/entities/schedule.entity';

const pricingTierSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['SOLO', 'DUO', 'GROUP'],
      required: true,
    },

    peopleCount: {
      type: Number,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const ScheduleSchema = new Schema<ISchedule>(
  {
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: [true, 'Package ID is required'],
      index: true,
    },

    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reportingTime: {
      type: String,
      required: true,
      trim: true,
    },

    reportingLocation: {
      type: String,
      required: true,
      trim: true,
    },

    pricing: {
      type: [pricingTierSchema],
      required: true,
    },

    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },

    seatsBooked: {
      type: Number,
      default: 0,
      min: [0, 'Seats booked cannot be negative'],
    },

    status: {
      type: String,
      enum: Object.values(SCHEDULE_STATUS),
      default: SCHEDULE_STATUS.UPCOMING,
    },
    notes: { type: String, trim: true, default: null },

    // Cancellation metadata
    cancellationReason: { type: String, trim: true, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBookings: { type: Number, default: null },
    totalRefunded: { type: Number, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ScheduleSchema.index({ packageId: 1, status: 1 });
ScheduleSchema.index({ vendorId: 1, status: 1, startDate: -1 });

ScheduleSchema.index({ status: 1, startDate: 1 }); // cron works
ScheduleSchema.index({ status: 1, endDate: 1 });

const SchedulePackageModel = mongoose.model<ISchedule>('SchedulePackage', ScheduleSchema);
export default SchedulePackageModel;
