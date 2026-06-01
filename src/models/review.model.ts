import { Schema, model } from 'mongoose';
import { IReview } from '../types/entities/review.entity';

const FileSchema = new Schema(
  {
    key: { type: String, default: null },
    
  },
  { _id: false },
);

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    packageId: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
      index: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [FileSchema],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const ReviewModel = model<IReview>('Review', reviewSchema);

reviewSchema.index({ packageId: 1, isDeleted: 1, createdAt: -1 })  
reviewSchema.index({ userId: 1,    isDeleted: 1 })                 
reviewSchema.index({ vendorId: 1,  isDeleted: 1, createdAt: -1 })             
reviewSchema.index({ rating: 1 })   