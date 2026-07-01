import { Schema, Document } from 'mongoose';

export interface ITripEmbedding extends Document {
  scheduleId: Schema.Types.ObjectId;
  packageId: Schema.Types.ObjectId;

  combinedText: string; // for rag
  embedding: number[]; // for vector search

  location: string; // for pre-filter
  state: string;
  title: string;
  minPrice: number;
  startDate: Date;
  endDate: Date;
  seatsAvailable: number;
  difficultyLevel: string;
  days: string;
  nights: string;
  isActive: boolean;
}