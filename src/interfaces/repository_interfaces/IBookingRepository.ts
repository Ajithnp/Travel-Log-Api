import {
  BookingListResult,
  BookingStatus,
  CancellationRequestResult,
  IBooking,
  IBookingPopulated,
  ICancellationRequestPopulatedBooking,
  IVendorScheduleBookingSummary,
  ScheduleBookingListResult,
  IScheduleBookingSinglePopulated,
} from '../../types/entities/booking.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose, { ClientSession } from 'mongoose';

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
    sripePaymentIntentId?: string,
    session?: mongoose.ClientSession,
  ): Promise<IBooking | null>;

  markFailedPayment(bookingId: string): Promise<IBooking | null>;

  cancelBooking(
    bookingId: string,
    userId: string,
    update: {
      cancellationReason: string;
      cancellationStatus: string;
      cancelledAt: Date;
      cancelationRefundAmount?: number;
    },
  ): Promise<IBooking | null>;

  findBookings(filters: BookingFilters): Promise<BookingListResult>;

  getCancellationRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<CancellationRequestResult>;

  getCancellationRequestById(
    bookingId: string,
  ): Promise<ICancellationRequestPopulatedBooking | null>;

  findOneAndUpdateReject(bookingId: string, rejectedReason: string): Promise<IBooking | null>;

  findBookingWithSession(
    bookingId: string,
    session: ClientSession,
  ): Promise<IBookingPopulated | null>;

  updateBookingWithSession(
    bookingId: string,
    update: Partial<IBooking>,
    session: ClientSession,
  ): Promise<IBooking | null>;

  getVendorScheduleBookingSummary(
    scheduleId: string,
    vendorId: string,
  ): Promise<IVendorScheduleBookingSummary | null>;

  findBookingsBySchedule(
    scheduleId: string,
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    filter?:string
  ): Promise<ScheduleBookingListResult>;

  getVendorBookingDetails(
    bookingId: string,
    scheduleId: string,
    vendorId: string,
  ): Promise<IScheduleBookingSinglePopulated | null>;
}

export interface BookingFilters {
  userId: string;
  bookingStatus?: BookingStatus;
  search?: string;
  page: number;
  limit: number;
}
