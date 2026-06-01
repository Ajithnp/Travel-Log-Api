import mongoose, { Document } from 'mongoose';
import { IFile } from './base-package.entity';



export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId : mongoose.Types.ObjectId;
  packageId : mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId; 
  vendorId: mongoose.Types.ObjectId;
  rating : number; 
  text : string;
  images ?: IFile[];
  isDeleted:Boolean;
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