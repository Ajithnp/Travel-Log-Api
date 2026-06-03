import { VendorOfferFilters } from '../../../types/db';

export interface IVendorOfferService {
  createOffer(vendorId: string, payload: CreateOfferRequestDTO): Promise<void>;
  getVendorOffers(vendorId: string, query: VendorOfferFilters): Promise<PaginatedOfferResponse>;
  deactivateOffer(vendorId: string, offerId: string): Promise<void>;
}

export interface CreateOfferRequestDTO {
  packageId: string;
  scheduleId?: string;
  name: string;
  discountType: 'percentage';
  discountValue: number;
  maxDiscountCap?: number;
  minBookingAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil: string;
}

export interface OfferResponseDTO {
  id: string;
  vendorId: string;
  packageId: string;
  packageTittle: string;
  scheduleId: string | null;
  name: string;
  discountType: 'percentage';
  discountValue: number;
  maxDiscountCap: number | null;
  minBookingAmount: number | null;
  usageLimit: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

export interface PaginatedOfferResponse {
  data: OfferResponseDTO[];
  totalDocs: number;
  currentPage: number;
  totalPages: number;
  activeCount: number;
  inactiveCount: number;
}
