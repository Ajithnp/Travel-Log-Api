import { Document, Types } from 'mongoose';

export interface IFiles {
  url: string;
  publicId: string;
}

export interface IPackage extends Document {
  vendorId: Types.ObjectId;
  title: string;
  location: string;
  description: string;
  itinerary: Array<{ day: number; activity: string }>;
  pricePerPerson: number;
  images: IFiles[];
  totalSchedules: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
