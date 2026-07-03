import mongoose, { Document } from 'mongoose';

export interface ITripEmbedding extends Document {
  _id:mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;

  combinedText: string; // for rag
  embedding: number[]; // for vector search

  location: string; // for pre-filter
  state: string;
  title: string;
  imageKey: string | null;
  minPrice: number;
  startDate: Date;
  endDate: Date;
  seatsAvailable: number;
  difficultyLevel: string;
  category: string;
  days: string;
  nights: string;
  packageAverageRating: number;
  packageTotalReviews: number;
  isActive: boolean;
}