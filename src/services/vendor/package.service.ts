import { inject, injectable } from 'tsyringe';
import { IPackageService } from '../../interfaces/service_interfaces/vendor/IPackageService';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';

import {
  CreateBasePackageDTO,
  BasePackageResponseDTO,
} from '../../validators/vendor/package/base-package.schema';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { Types } from 'mongoose';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import { BasePackageSingleResponseDTO } from '../../types/dtos/admin/response.dtos';
import { CustomQueryOptions } from '../../types/common/IQueryOptions';
import { FilterQuery } from 'mongoose';
import { IBasePackageEntity, IFile } from '../../types/entities/base-package.entity';
import { PACKAGE_STATUS } from '../../shared/constants/constants';
import { IFileStorageHandlerService } from '../../interfaces/service_interfaces/IFileStorageBusinessService';

@injectable()
export class PackageService implements IPackageService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IFileStorageHandlerService')
    private _fileStorageHandlerService: IFileStorageHandlerService,
  ) {}

  private async processPackageImages(images: { key: string; status: string }[]): Promise<IFile[]> {
    const uploaded = images.filter((img) => img.status === 'UPLOADED');
    const removed = images.filter((img) => img.status === 'REMOVED');

    if (removed.length > 0) {
      await Promise.all(removed.map((img) => this._fileStorageHandlerService.deleteFile(img.key)));
    }
    return uploaded.map((img) => ({ key: img.key }));
  }
  //=======================================
  async fetchPackages(
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<BasePackageSingleResponseDTO>> {
    const skip = (page - 1) * limit;

    const query: FilterQuery<IBasePackageEntity> = {
      vendorId,
    };
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (selectedFilter && selectedFilter !== 'all') {
      query.status = selectedFilter;
    }

    const options = {
      skip,
      limit,
      sort: { createdAt: -1 },
    };

    const [packages, totalDocs] = await Promise.all([
      this._basePackageRepository.findAll(query, options),
      this._basePackageRepository.countDocuments(query),
    ]);

    const packageData: BasePackageSingleResponseDTO[] = packages.map((pkg) => ({
      id: pkg._id.toString(),
      title: pkg.title ?? '',
      location: pkg.location ?? '',
      durationDays: pkg.days ?? 0,
      durationNights: pkg.nights ?? 0,
      imageUrl: pkg.images?.map((image: IFile) => ({ key: image.key })) ?? [],
      status: pkg.status,
      category: pkg.category ?? '',
      difficultyLevel: pkg.difficultyLevel ?? '',
      basePrice: pkg.basePrice ?? 0,
    }));

    const response = {
      data: packageData,
      currentPage: page,
      totalPages: Math.ceil(totalDocs / limit),
      totalDocs,
    };
    return response;
  }
  //====================================================================

  async fetchPackagesWithId(vendorId: string, packageId: string): Promise<BasePackageResponseDTO> {
    const vendorObjectId = toObjectId(vendorId);
    const packageObjectId = toObjectId(packageId);

    const packageExist = await this._basePackageRepository.findOne({
      _id: packageObjectId,
      vendorId: vendorObjectId,
    });

    if (!packageExist) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    return {
      ...packageExist.toObject(),
      packageId: packageExist._id.toString(),
      vendorId: vendorObjectId.toString(),
    };
  }

  //==================================================================
  async createPackage(
    vendorId: string,
    payload: CreateBasePackageDTO,
  ): Promise<{ packageId: string }> {
    const vendorObjectId = toObjectId(vendorId);

    // Step 1 — Only approved vendors can create packages
    const vendor = await this._vendorInfoRepository.findVendorWithUserId(vendorId);

    if (!vendor || vendor.status !== VENDOR_VERIFICATION_STATUS.APPROVED) {
      throw new AppError(ERROR_MESSAGES.VENDOR_NOT_VERIFIED, HTTP_STATUS.FORBIDDEN);
    }

    // Step 2 — Prevent duplicate published packages with same title
    if (payload.title) {
      const existingPublished = await this._basePackageRepository.findOne({
        vendorId: vendorObjectId,
        title: payload.title,
        status: PACKAGE_STATUS.PUBLISHED,
      });

      if (existingPublished) {
        throw new AppError(ERROR_MESSAGES.PACKAGE_ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }
    }

    // Step 3 — Process images if any were sent
    let imageKeys: IFile[] | undefined;
    if (payload.images && payload.images.length > 0) {
      imageKeys = await this.processPackageImages(payload.images);
    }

    const newPackage = await this._basePackageRepository.create({
      ...payload,
      vendorId: vendorObjectId,
      ...(imageKeys && { images: imageKeys }),
    });

    return { packageId: newPackage._id.toString() };
  }
  //==========================================================
  async updatePackage(vendorId: string, packageId: string, payload: CreateBasePackageDTO) {
    const vendorObjectId = toObjectId(vendorId);
    const packageObjectId = toObjectId(packageId);

    const existingPackage = await this._basePackageRepository.findOne({
      _id: packageObjectId,
      vendorId: vendorObjectId,
    });

    if (!existingPackage) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      existingPackage.status === PACKAGE_STATUS.SOFT_DELETED ||
      existingPackage.status === PACKAGE_STATUS.PUBLISHED
    ) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_CANNOT_EDIT, HTTP_STATUS.BAD_REQUEST);
    }

    let imageKeys: IFile[] | undefined;

    if (payload.images) {
      imageKeys = await this.processPackageImages(payload.images);
    }

    await this._basePackageRepository.findOneAndUpdate(
      { _id: packageObjectId },
      {
        ...payload,
        ...(imageKeys && { images: imageKeys }),
      },
    );
  }
}
