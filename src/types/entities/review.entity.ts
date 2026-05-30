import mongoose, { Document } from 'mongoose';
import { IFile } from './base-package.entity';



export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  userId : mongoose.Types.ObjectId;
  packageId : mongoose.Types.ObjectId;
  bookingId: mongoose.Types.ObjectId; 
  vendorId: mongoose.Types.ObjectId;
  rating : number; // Yes 1 to 5 stars (integer)
  text : string;
  images ?: IFile[];
  isDeleted:Boolean;
  createdAt: Date;
  updatedAt: Date;
}
