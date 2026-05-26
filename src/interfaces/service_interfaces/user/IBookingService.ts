import { BookingListResult, PaymentMethod } from 'types/entities/booking.entity';
import { PricingType } from '../../../types/entities/schedule.entity';
import { BookingFilters } from '../../../interfaces/repository_interfaces/IBookingRepository';
import { BookingDetailDTO } from '../../../shared/mappers/booking.mapper';

export interface InitiateBookingDTO {
  userId: string;
  packageId: string;
  scheduleId: string;
  tierType: PricingType;
  seatsCount: number;
  useWallet: boolean;
  travelers: Array<{
    fullName: string;
    idType: string;
    idNumber: string;
    isLead: boolean;
    phoneNumber?: string;
    emailAddress?: string;
    emergencyContact?: string;
    relation?: string;
  }>;
  amountInPaise: number;
}

export interface ConfirmBookingDTO {
  userId: string;
  bookingId: string;
  stripePaymentIntentId?: string;
}

export type GetBookingsDTO = Omit<BookingFilters, 'userId'>;

export interface RetryBookingPaymentDTO {
  userId: string;
  bookingId: string;
}

// ─── Response DTOs ───

export interface InitiateBookingResponseDTO {
  bookingId: string;
  paymentMethod: PaymentMethod;
  clientSecret?: string;
  checkoutUrl?: string;
  walletAmountUsed?: number;
  stripeAmount?: number;
}

export interface ConfirmBookingResponseDTO {
  bookingId: string;
  bookingCode?: string;
  amount: number;
  message: string;
}

export type VerifyPaymentResponseDTO =
  | {
      status: 'success';
      bookingCode: string;
      bookingId: string;
      amount: number;
    }
  | {
      status: 'failure';
      bookingCode: string;
      bookingId: string;
      amount: number;
    };

export interface PaginatedBookingResponse {
  bookings: BookingListResult['bookings'];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CancelBookingDTO {
  userId: string;
  bookingId: string;
  reason: string;
  details?: string;
}

export interface CancelBookingResponseDTO {
  refundAmount: number;
  refundPercent: number;
}

export interface IBookingService {
  initiateBooking(payload: InitiateBookingDTO): Promise<InitiateBookingResponseDTO>;
  confirmBooking(payload: ConfirmBookingDTO): Promise<ConfirmBookingResponseDTO>;
  failedBooking(bookingId: string, userId: string, paymentIntentId: string): Promise<void>;
  retryBookingPayment(payload: RetryBookingPaymentDTO): Promise<InitiateBookingResponseDTO>;
  verifyPayment(stripeSessionId: string): Promise<VerifyPaymentResponseDTO>;
  getBookings(userId: string, filters: GetBookingsDTO): Promise<PaginatedBookingResponse>;
  getBookingDetails(userId: string, bookingId: string): Promise<BookingDetailDTO>;
  cancelBookingRequest(payload: CancelBookingDTO): Promise<CancelBookingResponseDTO>;
}
