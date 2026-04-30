import mongoose, { Document, Schema } from 'mongoose';
 
export interface ICancellationRule {
  daysBeforeTrip: number;
  refundPercent: number;
}
 
export interface ICancellationPolicy extends Document {
  _id: mongoose.Types.ObjectId;
  key: string;         
  label: string;         
  description?: string;
  rules: ICancellationRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}