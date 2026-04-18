import { inject, injectable } from 'tsyringe';
import { IPublicVendorService } from '../../interfaces/service_interfaces/user/IPublicVendorService';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
import { VendorPublicProfileResponseDTO } from '../../types/dtos/user/response.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { PackageMapper } from '../../shared/mappers/package.mapper';

@injectable()
export class PublicVendorService implements IPublicVendorService {
  constructor(
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepository: ISchedulePackageRepository,
  ) {}

  
  async getVendorPublicProfile(
    vendorId: string,
    page: number,
    limit: number,
  ): Promise<VendorPublicProfileResponseDTO> {

    const vendorInfo = await this._vendorInfoRepository.findVendorWithUserId(vendorId);

    if (
      !vendorInfo ||
      !vendorInfo.isProfileVerified ||
      vendorInfo.status !== VENDOR_VERIFICATION_STATUS.APPROVED
    ) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    const [{ packages, total }, totalTripsCompleted] = await Promise.all([
      this._basePackageRepository.findVendorPublicPackages(vendorId, page, limit),
      this._schedulePackageRepository.countCompletedByVendor(vendorId),
    ]);
      
    const totalPages = Math.ceil(total / limit);

    return {
      vendor: {
        businessName: vendorInfo.userId.name,
        profilePhoto: vendorInfo.documents?.profileLogo?.key ?? null,
        about: null,
        location: vendorInfo.businessInfo?.businessAddress ?? null,
        averageRating: 0,
        totalPackages: total,
        totalTripsCompleted,
        createdAt: vendorInfo.userId.createdAt,
        isVerified: vendorInfo.isProfileVerified,
      },
      packages: packages.map((p) => PackageMapper.toPublicListing(p)),
      total,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
    };
  }
}