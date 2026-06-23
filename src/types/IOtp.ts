import { Document, Types } from 'mongoose';

export interface IOtp extends Document {
  _id: Types.ObjectId;
  email: string;
  otp: string;
  createdAt: Date;
  updatedAt: Date;
}
