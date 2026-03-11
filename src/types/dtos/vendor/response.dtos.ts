import { CategoryStatus } from 'shared/constants/constants';
import { ScheduleStatus } from 'shared/constants/constants';
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
  status: 'Pending' | 'Approved' | 'Rejected' | 'NotSubmitted';
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
  startDate:         Date
  endDate:           Date
  reportingTime:     string
  reportingLocation: string
  pricing:         PricingTierDTO[];
  totalSeats:        number
  seatsBooked:       number
  seatsRemaining:    number
  notes:             string | null
  status:            ScheduleStatus
  cancellationReason: string | null
  cancelledAt:        Date | null
  cancelledBookings:  number | null
  totalRefunded:      number | null
  createdAt:         Date
  updatedAt:         Date
}

