import mongoose, { Document, Types } from 'mongoose';
import { SCHEDULE_STATUS } from '../../shared/constants/constants';

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export type PricingType = 'SOLO' | 'DUO' | 'GROUP';

export interface IPricingTier {
  type: PricingType;
  peopleCount: number;
  price: number;
}

export interface ISchedule extends Document {
  _id: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reportingTime: string;
  reportingLocation: string;
  pricing: IPricingTier[];
  totalSeats: number;
  seatsBooked: number;
  status: ScheduleStatus;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBookings?: number;
  totalRefunded?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISchedulePopulated extends Omit<ISchedule, 'packageId'> {
  packageId: {
    _id: Types.ObjectId;
    title: string;
    days: string;
    difficultyLevel?: string;
  };
}

export interface ISchedulePopulatedPacakge extends Omit<ISchedule, 'packageId'> {
  packageId: {
    _id: Types.ObjectId;
    title: string;
    location: string;
    state: string;
    basePrice: string;
  };
}
