import { PaginatedData } from '../../../types/common/IPaginationResponse';
import { UserProfileResponseDTO } from 'types/dtos/user/response.dtos';
import {
  CancelationStatus,
  PopulatedCancellationRequest,
} from '../../../types/entities/booking.entity';
import { RefundBreakdown } from '../../../shared/utils/cancellation-policy/policy-refund-calculator';

export interface IAdminUserService {
  fetchUsers(
    page: number,
    limit: number,
    role: string,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<Partial<UserProfileResponseDTO>>>;

  updateUserAccess(id: string, block: boolean, reason?: string, token?: string): Promise<void>;

  getCancellationRequests(
    page: number,
    limit: number,
    status?: string,
  ): Promise<PaginatedData<PopulatedCancellationRequest>>;

  getCancellationRequestDetails(bookingId: string): Promise<DetailedCancellationRequestResponseDTO>;

  rejectCancellationRequest(
    bookingId: string,
    userId: string,
    rejectedReason: string,
  ): Promise<void>;

  approveCancellationRequest(bookingId: string): Promise<void>;
}

export interface DetailedCancellationRequestResponseDTO {
  bookingId: string;
  bookingCode: string;
  userName: string;
  email: string;
  phoneNo: string;
  vendorName: string;
  startDate: Date;
  packageName: string;
  cancellationPolicyLabel: string;
  rules: { daysBeforeTrip: number; refundPercent: number }[];
  travelersCount: number;
  groupType: string;
  cancellationReason: string | null;
  cancellationStatus: CancelationStatus;
  updatedAt: Date;
  finalAmount: number;
  cancellationRefundAmount: number | null;
  cancellationRejectedReason: string | null;
  calculation: RefundBreakdown | null;
}
