import mongoose, { Document, Types } from 'mongoose';
import { CategoryStatus } from 'shared/constants/constants';
import { IFile } from './base-package.entity';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string; // "Adventure Trekking" → "adventure-trekking"
  description?: string;
  icon?: IFile;
  isActive: boolean;
  status: CategoryStatus;
  createdBy?: Types.ObjectId;
  requestedBy?: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
