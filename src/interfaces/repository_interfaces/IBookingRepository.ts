import { BookingStatus, IBooking, PaymentStatus } from 'types/entities/booking.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose from 'mongoose';

export interface IBookingRepository extends IBaseRepository<IBooking> {
  createBooking(data: Partial<IBooking>, session?: mongoose.ClientSession): Promise<IBooking>;

  findById(id: string): Promise<IBooking | null>;

  findActiveBookingByUserAndSchedule(userId: string, scheduleId: string): Promise<IBooking | null>;

  findByIdAndUser(id: string, userId: string): Promise<IBooking | null>;

  attachPaymentIntent(
    bookingId: string,
    paymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null>;

  confirmBooking(
    userId: string,
    scheduleId: string,
    bookingId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null>;

  markFailedPayment(bookingId: string): Promise<IBooking | null>;
}

export interface CreateBookingDTO {
  userId: string;
  packageId: string;
  scheduleId: string;
  vendorId: string;
  groupType: string;
  travelerCount: number;
  travelers: Array<{
    name: string;
    age: number;
    gender?: string;
    phone?: string;
    isLead: boolean;
  }>;
  grossAmount: number;
  discountAmount: number;
  walletAmountUsed: number;
  finalAmount: number;
  platformCommission: number;
  vendorEarning: number;
  seatHoldExpiry: Date;
}

export interface BookingFilters {
  userId: string;
  bookingStatus?: BookingStatus;
  page: number;
  limit: number;
}
