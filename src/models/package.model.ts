import { Schema, ObjectId } from 'mongoose';
import { IPackage } from '../types/entities/package.entity';

const packageSchema = new Schema<IPackage>({
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'VendorInfo',
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  itinerary: [
    {
      day: Number,
      activity: String,
    },
  ],
});
