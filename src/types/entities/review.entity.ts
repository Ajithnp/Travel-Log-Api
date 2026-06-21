import mongoose, { Document } from 'mongoose';
import { IFile } from './base-package.entity';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  rating: number;
  text: string;
  images?: IFile[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedUser {
  _id: mongoose.Types.ObjectId;
  name: string;
}

export interface IReviewUserPopulated extends Omit<IReview, 'userId'> {
  userId: IPopulatedUser;
}

export interface IPopulatedPackage {
  _id: mongoose.Types.ObjectId;
  title: string;
}

export interface IReviewDetailsPopulated extends Omit<IReview, 'packageId' | 'userId'> {
  packageId: IPopulatedPackage;
  userId: IPopulatedUser;
}