import { model, Schema } from "mongoose";
import { ITripEmbedding } from "../types/entities/trip-embedding.entity";

const TripEmbeddingSchema = new Schema<ITripEmbedding>(
  {
    scheduleId: {
      type: Schema.Types.ObjectId,
      ref: 'SchedulePackage',
      required: true,
      unique: true, // one schedule -one embedding
    },

    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },

    combinedText: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      required: true,
    },

    imageKey: { type: String, default: null },

    // Filter fields
    location: { type: String },
    state: { type: String },
    title: { type: String },
    minPrice: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    seatsAvailable: { type: Number },
    difficultyLevel: { type: String },
    category: { type: String },
    days: { type: String },
    nights: { type: String },
    packageAverageRating: { type: Number, default: 0 },
    packageTotalReviews: { type: Number, default: 0 },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const TripEmbeddingModel = model<ITripEmbedding>('TripEmbedding', TripEmbeddingSchema);