import mongoose ,{ Schema } from 'mongoose';
import { IBasePackage } from '../types/entities/base-package.entity';

/* ---------- Sub Schemas ---------- */

const FileSchema = new Schema(
  {
    key: { type: String, required: true },
    fieldName: { type: String, required: true },
  },
  { _id: false }
);

const ActivitySchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ["travel", "meal", "stay", "sightseeing", "activity", "free"],
      required: true,
    },
    included: { type: Boolean, required: true },
  },
  { _id: false }
);

const DayItinerarySchema = new Schema(
  {
    dayNumber: { type: Number, required: true, min: 1 },
    title: { type: String, required: true },
    activities: { type: [ActivitySchema], default: [] },
  },
  { _id: false }
);

/* ---------- Base Package Schema ---------- */

const BasePackageSchema = new Schema<IBasePackage>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: ["weekend", "adventure", "family", "honeymoon"],
      required: true,
    },

    images: {
      type: [FileSchema],
      default: [],
    },

    duration: {
      days: { type: Number, required: true, min: 1 },
      nights: { type: Number, required: true, min: 0 },
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    itinerary: {
      type: [DayItinerarySchema],
      default: [],
    },

    inclusions: {
      type: [String],
      default: [],
    },

    exclusions: {
      type: [String],
      default: [],
    },

    difficultyLevel: {
      type: String,
      enum: ["easy", "moderate", "hard"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

export const BasePackageModel = mongoose.model<IBasePackage>(
  "BasePackage",
  BasePackageSchema
);

