import mongoose, { Document, Schema } from 'mongoose';
 
export interface ICancellationRule {
  daysBeforeTrip: number;
  refundPercent: number;
}
 
export interface ICancellationPolicy extends Document {
  key: string;         
  label: string;         
  description?: string;
  rules: ICancellationRule[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}