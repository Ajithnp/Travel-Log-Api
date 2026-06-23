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
  ITicketPopulatedBooking,
  GroupType,
} from '../../types/entities/booking.entity';
import { IBaseRepository } from './IBaseRepository';
import mongoose, { ClientSession, Types } from 'mongoose';
import { CommissionOverview } from '../service_interfaces/admin/IAdminFinanceService';

export interface IBookingRepository extends IBaseRepository<IBooking> {
  createBooking(data: Partial<IBooking>, session?: mongoose.ClientSession): Promise<IBooking>;

  findOneAndPopulate(bookingId: string): Promise<ITicketPopulatedBooking | null>;

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
    filter?: string,
  ): Promise<ScheduleBookingListResult>;

  getVendorBookingDetails(
    bookingId: string,
    scheduleId: string,
    vendorId: string,
  ): Promise<IScheduleBookingSinglePopulated | null>;

  getTotalRevanueByVendorId(vendorId: string): Promise<{ totalRevenue: number } | null>;

  getCommissionOverview(): Promise<CommissionOverview>;

  findPayableBookingsBySchedule(scheduleId: string): Promise<SchedulePayoutTotals | null>;

  findAllBookingsByScheduleId(scheduleId: string): Promise<ScheduleBookingsResult[] | null>;

  findBookingStatsByScheduleId(scheduleId: string): Promise<BookingStatsResult | null>;

  payoutOverviewByScheduleId(scheduleId: string): Promise<PayoutScheduleOverviewStats>;

  getAnalytics(
    vendorId: string,
    from: Date,
    to: Date,
    granularity: string,
  ): Promise<AnalyticsDataPoint[]>;

  getTopPerformingPackages(
    vendorId: string,
    limit?: number,
  ): Promise<Array<{ packageTitle: string; bookingCount: number }>>;

  getRecentActivity(vendorId: string, limit?: number): Promise<RecentBookingActivityResult[]>;
}

export interface SchedulePayoutTotals {
  vendorId: string;
  grossAmount: number;
  commissionAmount: number;
  vendorEarnings: number;
  totalAmountFromCancelation: number;
  bookingIds: Types.ObjectId[];
  bookingCount: number;
}

export interface BookingFilters {
  userId: string;
  bookingStatus?: BookingStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface ScheduleBookingsResult {
  userName: string;
  selectedGroupType: GroupType;
  finalAmount: number;
  platformCommission: number;
  vendorEarning: number;
}

export interface PayoutScheduleOverviewStats {
  totalBookingsCount: number;
  totalGrossAmount: number;
  totalPlatformCommission: number;
  totalVendorEarnings: number;
}

export interface BookingStatsResult {
  packageTitle: string;
  vendorName: string;
  scheduleStartDate: Date;
  scheduleEndDate: Date;
  schedulePayoutStatus: 'pending' | 'paid';
  totalBookingsCount: number;
  totalCancellationsCount: number;
  totalBookingGross: number;
  totalPlatformCommission: number;
  totalVendorEarnings: number;
  totalRefundedAmount: number;
}

export interface RecentBookingActivityResult {
  id: string;
  userName: string;
  packageTitle: string;
  startDate: Date;
  endDate: Date;
  groupType: GroupType;
  travellerCount: number;
  finalAmount: number;
  status: BookingStatus;
  createdAt: Date;
}

export interface AnalyticsDataPoint {
  _id: string;
  count: number;
  revenue: number;
}
