import { injectable, inject } from 'tsyringe';
import {
  CreateOfferRequestDTO,
  IVendorOfferService,
  PaginatedOfferResponse,
} from '../../interfaces/service_interfaces/vendor/IVendorOfferService';
import { IOfferRepository } from '../../interfaces/repository_interfaces/IOfferRepository';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { REPOSITORY_TOKENS } from '../../shared/constants/di.tokens';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { IOfferEntity } from '../../types/entities/offer.entity';
import { VendorOfferFilters } from '../../types/db';

@injectable()
export class VendorOfferService implements IVendorOfferService {
  constructor(
    @inject(REPOSITORY_TOKENS.OFFER_REPOSITORY)
    private _offerRepository: IOfferRepository,
    @inject('IBasePackageRepository')
    private _packageRepository: IBasePackageRepository,
  ) {}

  async createOffer(vendorId: string, payload: CreateOfferRequestDTO): Promise<void> {
    const pkg = await this._packageRepository.findById(payload.packageId);

    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!pkg.isActive || pkg.isDeleted) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_ABLE_TO_ADD_OFFER, HTTP_STATUS.BAD_REQUEST);
    }

    if (pkg.vendorId.toString() !== vendorId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.FORBIDDEN);
    }

    const alreadyHaveActiveOffer = await this._offerRepository.findOne({
      vendorId: toObjectId(vendorId),
      packageId: toObjectId(payload.packageId),
      isActive: true,
    });

    if (alreadyHaveActiveOffer && alreadyHaveActiveOffer.validUntil > new Date()) {
      throw new AppError(ERROR_MESSAGES.ALREADY_HAVE_ACTIVE_OFFER, HTTP_STATUS.BAD_REQUEST);
    }
    const validUntil = new Date(payload.validUntil);

    await this._offerRepository.create({
      vendorId: toObjectId(vendorId),
      packageId: toObjectId(payload.packageId),
      scheduleId: payload.scheduleId ? toObjectId(payload.scheduleId) : null,
      name: payload.name,
      discountType: 'percentage',
      discountValue: payload.discountValue,
      usageLimit: payload.usageLimit || undefined,
      validUntil,
      isActive: true,
      usedCount: 0,
    } as Partial<IOfferEntity>);
  }

  async getVendorOffers(
    vendorId: string,
    query: VendorOfferFilters,
  ): Promise<PaginatedOfferResponse> {
    const [totalActiveOffers, totalInactiveOffers] = await Promise.all([
      this._offerRepository.countDocuments({ vendorId: toObjectId(vendorId), isActive: true }),
      this._offerRepository.countDocuments({ vendorId: toObjectId(vendorId), isActive: false }),
    ]);
    const result = await this._offerRepository.findVendorOffers(vendorId, query);
    return {
      data: result.data,
      totalDocs: result.totalDocs,
      currentPage: query.page,
      totalPages: Math.ceil(result.totalDocs / query.limit),
      activeCount: totalActiveOffers,
      inactiveCount: totalInactiveOffers,
    };
  }

  async deactivateOffer(vendorId: string, offerId: string): Promise<void> {
    const offer = await this._offerRepository.findById(offerId);

    if (!offer) {
      throw new AppError(ERROR_MESSAGES.OFFER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (offer.vendorId.toString() !== vendorId) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED_ACCESS, HTTP_STATUS.FORBIDDEN);
    }

    if (!offer.isActive) {
      throw new AppError(ERROR_MESSAGES.OFFER_ALREADY_DEACTIVATED, HTTP_STATUS.BAD_REQUEST);
    }

    await this._offerRepository.findOneAndUpdate({ _id: offer._id }, { isActive: false });
  }
}
