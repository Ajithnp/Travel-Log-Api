import mongoose, { Document } from 'mongoose';
import {
  BOOKING_STATUS,
  CANCELATION_STATUS,
  CANCELLED_BY,
  GROUP_TYPE,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from 'shared/constants/booking';

export type GroupType = (typeof GROUP_TYPE)[keyof typeof GROUP_TYPE];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type CancelledBy = (typeof CANCELLED_BY)[keyof typeof CANCELLED_BY];
export type CancelationStatus = (typeof CANCELATION_STATUS)[keyof typeof CANCELATION_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export interface ITraveler {
  fullName: string;
  idType: string;
  idNumber: string;
  isLead: boolean;
  phoneNumber?: string;
  emailAddress?: string;
  emergencyContact?: string;
  relation?: string;
}

export interface IBooking extends Document {
  _id: mongoose.Types.ObjectId;
  bookingCode: string;
  userId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  scheduleId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;

  groupType: GroupType;
  travelerCount: number;
  travelers: ITraveler[];

  grossAmount: number; // pricing[groupType] from schedule at time of booking
  discountAmount: number; // offer + coupon combined
  walletAmountUsed: number; // wallet balance applied
  finalAmount: number; // grossAmount - discountAmount - walletAmountUsed
  platformCommission: number; // 15% of grossAmount
  vendorEarning: number; // grossAmount - platformCommission

  couponId?: mongoose.Types.ObjectId | null;
  offerId?: mongoose.Types.ObjectId | null;

  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  transactionId?: string | null;

  bookingStatus: BookingStatus;
  cancellationReason?: string;
  cancelationRefundAmount?: number;
  cancellationStatus?: CancelationStatus;
  cancelledAt?: Date;
  cancellationRejectedReason?: string;

  isAttended: boolean;
  attendedAt?: Date;
  hasReviewed: boolean;
  ticketUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

export interface IPopulatedPackage {
  _id: mongoose.Types.ObjectId;
  title: string;
}

export interface IPopulatedSchedule {
  _id: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalSeats: number;
  seatsBooked: number;
}

export interface IScheduleStartDatePopulated extends Omit<IBooking, 'scheduleId' | 'packageId'> {
  scheduleId: IPopulatedSchedule;
  packageId: IPopulatedPackage;
}

export interface IBookingPopulated extends Omit<IBooking, 'packageId'> {
  packageId: IPopulatedPackage;
}

export interface PopulatedBooking extends Omit<IBooking, 'packageId' | 'scheduleId'> {
  packageId: {
    title: string;
    state: string;
    location: string;
  };
  scheduleId: {
    startDate: string;
    endDate: string;
    reportingTime: string;
  } | null;
}

export interface BookingListResult {
  bookings: PopulatedBooking[];
  total: number;
}

export interface PopulatedCancellationRequest {
  _id: string;
  bookingCode: string;
  updatedAt: Date;
  finalAmount: number;
  cancelationRefundAmount: number;
  cancellationStatus: CancelationStatus;
  packageTittle: string;
  userName: string;
}

export interface CancellationRequestResult {
  requests: PopulatedCancellationRequest[];
  total: number;
}

export interface ICancellationRequestPopulatedBooking
  extends Omit<IBooking, 'userId' | 'vendorId' | 'packageId' | 'scheduleId'> {
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone: string;
  };
  vendorId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
  packageId: {
    title: string;
    cancellationPolicy: {
      _id: mongoose.Types.ObjectId;
      key: string;
      label: string;
      isActive: boolean;
      rules: { daysBeforeTrip: number; refundPercent: number }[];
    } | null;
  };
  scheduleId: {
    _id: mongoose.Types.ObjectId;
    startDate: Date;
  };
}

export interface IVendorScheduleBookingSummary {
  totalConfirmedBookings: number;
  totalCancelledBookings: number;
  totalConfirmedAmount: number;
  totalCancelledAmount: number;
  totalVendorEarning: number;
  totalPlatformCommission: number;
}

export interface IScheduleBookingPopulated {
  _id: mongoose.Types.ObjectId;
  bookingCode: string;
  userId: {
    name: string;
  };
  groupType: GroupType;
  travelerCount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: Date;
}

export interface ScheduleBookingListResult {
  bookings: IScheduleBookingPopulated[];
  total: number;
}

export interface IScheduleBookingSinglePopulated extends Omit<IBooking, 'userId'> {
  userId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
}

export interface ITicketPopulatedBooking
  extends Omit<IBooking, 'packageId' | 'scheduleId' | 'vendorId'> {
  packageId: {
    _id: mongoose.Types.ObjectId;
    title: string;
    location: string;
    state: string;
    difficultyLevel: string;
    days: number;
    nights: number;
    inclusions: string[];
  } | null;
  scheduleId: {
    _id: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    reportingTime: string;
    reportingLocation: string;
  } | null;
  vendorId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  } | null;
}
