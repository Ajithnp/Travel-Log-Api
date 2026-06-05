import { IOfferEntity } from '../../types/entities/offer.entity';
import { IBaseRepository } from './IBaseRepository';
import { VendorOfferFilters } from '../../types/db';
import { OfferResponseDTO } from '../service_interfaces/vendor/IVendorOfferService';

export interface IOfferRepository extends IBaseRepository<IOfferEntity> {
  findVendorOffers(vendorId: string, query: VendorOfferFilters): Promise<PaginatedOfferResult>;
  hasActiveOfferByPackage(packageId: string): Promise<Offer>;
  updateUsageCount(offerId: string): Promise<void>;
}

export interface PaginatedOfferResult {
  data: OfferResponseDTO[];
  totalDocs: number;
}

export interface Offer {
  hasOffer: boolean;
  offerPercentage: number;
  offerId: string;
}
