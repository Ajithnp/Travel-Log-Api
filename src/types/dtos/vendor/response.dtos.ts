import { CategoryStatus } from '../../../shared/constants/constants';
import { ScheduleStatus } from '../../../shared/constants/constants';
import { TravelerDTO } from '../../../shared/mappers/booking.mapper';
import { VendorStatus } from '../../../types/entities/vendor.info.entity';

export interface VendorProfileResponseDTO {
  id: string;
  userId?: string;
  profileLogo: string | null;
  name: string;
  email: string;
  phone: string;
  role: string;
  businessAddress: string | null;
  contactPersonName: string | null;
  status: VendorStatus;
  isProfileVerified: boolean;
  reasonForReject: string;
  createdAt: Date;
}

export interface VendorRequestedCategoryResponseDTO {
  id: string;
  name: string;
  adminNote: string | null;
  note: string | null;
  createdAt: string;
  status: CategoryStatus;
}

export interface ActiveCategoriesResponseDTO {
  id: string;
  name: string;
}

//======= schedule package ======================

export interface PricingTierDTO {
  type: 'SOLO' | 'DUO' | 'GROUP';
  peopleCount: number;
  price: number;
}

export interface ScheduleListItemDTO {
  scheduleId: string;
  packageId: string;
  packageTitle: string;
  packageDays: string;
  difficultyLevel: string;
  startDate: string;
  endDate: string;
  reportingTime: string;
  reportingLocation: string;
  pricing: PricingTierDTO[];
  soloPricing: number | null;
  totalSeats: number;
  seatsBooked: number;
  seatsRemaining: number;
  status: string;
  notes: string | null;
}

export interface ScheduleStatusCounts {
  upcoming: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  soldOut: number;
}

export interface ScheduleResponse {
  startDate: Date;
  endDate: Date;
  reportingTime: string;
  reportingLocation: string;
  pricing: PricingTierDTO[];
  totalSeats: number;
  seatsBooked: number;
  seatsRemaining: number;
  notes: string | null;
  status: ScheduleStatus;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBookings: number | null;
  totalRefunded: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VendorScheduleBookingSummaryDTO {
  scheduleId: string;
  packageTitle: string;
  packageLocation: string;
  packageState: string;
  basePrice: string;
  startDate: string;
  endDate: string;
  reportingTime: string;
  reportingLocation: string;
  totalSeats: number;
  // seatsBooked: number;
  scheduleStatus: string;
  totalConfirmedBookings: number;
  totalCancelledBookings: number;
  totalConfirmedAmount: number;
  totalCancelledAmount: number;
  totalVendorEarning: number;
  totalPlatformCommission: number;
}

export interface ScheduleBookingDetailDTO {
  id: string;
  username: string;
  bookingCode: string;
  groupType: string;
  travallersCount: number;
  finalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  bookedOn: string;
}

export interface ScheduleBookingSingleDetailDTO {
  id: string;
  username: string;
  bookingCode: string;
  groupType: string;
  paymentMethod: string | null;
  bookedOn: string;
  finalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  travelers: TravelerDTO[];
}

export interface ScheduleStatusResponseDTO {
  status: ScheduleStatus;
}


