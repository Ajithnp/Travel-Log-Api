import { BookingListResult, IBooking } from 'types/entities/booking.entity';
import { PricingType } from '../../../types/entities/schedule.entity';
import { BookingFilters } from '../../../interfaces/repository_interfaces/IBookingRepository';
import { BookingDetailDTO } from '../../../shared/mappers/booking.mapper';

// ─── Request DTOs ───────

export interface InitiateBookingDTO {
  userId: string;
  packageId: string;
  scheduleId: string;
  tierType: PricingType;
  seatsCount: number;
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
  stripePaymentIntentId: string;
}

export type GetBookingsDTO = Omit<BookingFilters, 'userId'> 

// ─── Response DTOs ───

export interface InitiateBookingResponseDTO {
  bookingId: string;
  clientSecret: string;
  checkoutUrl: string | null;  // redirect the user 
}

export interface ConfirmBookingResponseDTO {
  bookingId: string;
  message: string;
}

export type VerifyPaymentResponseDTO =
  | {
      status: "success";
      bookingId: string;
      amount: number;
    }
  | {
      status: "failure";
    };
export interface PaginatedBookingResponse {
  bookings: BookingListResult['bookings'];
  total:    number;
  page:     number;
  limit:    number;
  totalPages: number;
}



export interface IBookingService {
  initiateBooking(payload: InitiateBookingDTO): Promise<InitiateBookingResponseDTO>;
  confirmBooking(payload: ConfirmBookingDTO): Promise<ConfirmBookingResponseDTO>;
  verifyPayment(stripeSessionId: string): Promise<VerifyPaymentResponseDTO>;
  getBookings(userId: string, filters: GetBookingsDTO): Promise<PaginatedBookingResponse>;
  getBookingDetails(userId: string, bookingId: string): Promise<BookingDetailDTO>;
}
