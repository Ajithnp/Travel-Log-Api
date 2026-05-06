import { Schema, model } from 'mongoose';
import { IBasePackageEntity } from '../types/entities/base-package.entity';
import { PACKAGE_STATUS } from '../shared/constants/constants';

/* ---------- Sub Schemas ---------- */

const FileSchema = new Schema(
  {
    key: { type: String },
  },
  { _id: false },
);

const activitySchema = new Schema(
  {
    startTime: { type: String },
    endTime: { type: String },
    title: { type: String },
    description: { type: String },
    location: { type: String },
    specials: { type: [String], default: [] },
    included: { type: Boolean },
  },
  { _id: false },
);

const itineraryDaySchema = new Schema(
  {
    title: { type: String },
    dayNumber: { type: Number },
    activities: { type: [activitySchema], default: [] },
  },
  { _id: false },
);

/* ---------- Base Package Schema ---------- */

const packageSchema = new Schema<IBasePackageEntity>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: { type: String, trim: true },

    location: { type: String, trim: true },

    state: { type: String, trim: true },

    usp: { type: String, trim: true },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging', 'Extreme'],
    },

    description: { type: String },

    days: { type: String },
    nights: { type: String },

    basePrice: { type: String },

    images: { type: [FileSchema], default: [] },

    itinerary: { type: [itineraryDaySchema], default: [] },

    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    packingList: { type: [String], default: [] },

    cancellationPolicy: {
      type: String,
      enum: ['Flexible', 'Moderate', 'Strict', 'Non-Refundable'],
    },

    status: {
      type: String,
      enum: Object.values(PACKAGE_STATUS),
      default: PACKAGE_STATUS.DRAFT,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default:false
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const PackageModel = model<IBasePackageEntity>('Package', packageSchema);
