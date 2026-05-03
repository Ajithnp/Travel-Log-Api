import { PricingType } from '../../../types/entities/schedule.entity';

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

export interface IBookingService {
  initiateBooking(payload: InitiateBookingDTO): Promise<InitiateBookingResponseDTO>;
  confirmBooking(payload: ConfirmBookingDTO): Promise<ConfirmBookingResponseDTO>;
  verifyPayment(stripeSessionId: string): Promise<VerifyPaymentResponseDTO>;
}
