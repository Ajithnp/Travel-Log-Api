import { BookingListResult, BookingStatus, IBooking, IBookingPopulated } from '../../types/entities/booking.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose from 'mongoose';

export interface IBookingRepository extends IBaseRepository<IBooking> {
  createBooking(data: Partial<IBooking>, session?: mongoose.ClientSession): Promise<IBooking>;

  findById(id: string): Promise<IBooking | null>;

  findActiveBookingByUserAndSchedule(userId: string, scheduleId: string): Promise<IBooking | null>;

  findByIdAndUser(id: string, userId: string): Promise<IBooking | null>;

  findByIdAndUserLean(id: string, userId: string): Promise<IBookingPopulated | null>;

  attachPaymentIntent(
    bookingId: string,
    paymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null>;

  confirmBooking(
    userId: string,
    bookingId: string,
    sripePaymentIntentId: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null>;

  markFailedPayment(bookingId: string): Promise<IBooking | null>;

  findBookings(filters: BookingFilters): Promise<BookingListResult>;
}

export interface BookingFilters {
  userId: string;
  bookingStatus?: BookingStatus;
  search?: string;
  page: number;
  limit: number;
}
