import { inject, injectable } from 'tsyringe';
import { IPackageService } from '../../interfaces/service_interfaces/vendor/IPackageService';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { CreateBasePackageDTO } from '../../validators/vendor/package/base-package.schema';
import { VENDOR_VERIFICATION_STATUS } from '../../types/enum/vendor-verfication-status.enum';
import { AppError } from '../../errors/AppError';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { Types } from 'mongoose';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import {
  BasePackageSingleResponseDTO,
  PackageDetailDTO,
  PackageScheduleContextResponseDTO,
} from '../../types/dtos/admin/response.dtos';
import { PACKAGE_STATUS, SCHEDULE_STATUS } from '../../shared/constants/constants';
import { IFileStorageHandlerService } from '../../interfaces/service_interfaces/IFileStorageBusinessService';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import { FilterType } from '../../types/db';
import { PackageMapper } from '../../shared/mappers/package.mapper';
import { IBasePackagePopulated, IFile } from '../../types/entities/base-package.entity';
import logger from '../../config/logger';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
@injectable()
export class PackageService implements IPackageService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('IVendorInfoRepository')
    private _vendorInfoRepository: IVendorInfoRepository,
    @inject('IFileStorageHandlerService')
    private _fileStorageHandlerService: IFileStorageHandlerService,
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
    @inject('ISchedulePackageRepository')
    private _scheduleRepository: ISchedulePackageRepository,

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
    filters: FilterType,
  ): Promise<PaginatedData<BasePackageSingleResponseDTO>> {
    const { requests, total } = await this._basePackageRepository.findPackages(vendorId, filters);
    const response = {
      data: requests.map(PackageMapper.toResponse),
      currentPage: filters.page,
      totalPages: Math.ceil(total / filters.limit),
      totalDocs: total,
    };
    return response;
  }
  //====================================================================

  async fetchPackagesWithId(vendorId: string, packageId: string): Promise<PackageDetailDTO> {
    const vendorObjectId = toObjectId(vendorId);
    const packageObjectId = toObjectId(packageId);

    const packageExist = await this._basePackageRepository.findOnePopulated<IBasePackagePopulated>(
      {
        _id: packageObjectId,
        vendorId: vendorObjectId,
      },
      { path: 'categoryId', select: 'name' },
    );

    if (!packageExist) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return PackageMapper.toDetailResponse(packageExist);
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

    let categoryObjectId: Types.ObjectId | undefined;
    if (payload.categoryId) {
      categoryObjectId = toObjectId(payload.categoryId);
      const category = await this._categoryRepository.findById(payload.categoryId);

      if (!category) {
        throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      if (!category.isActive) {
        throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_ACTIVE, HTTP_STATUS.BAD_REQUEST);
      }
    }
    let imageKeys: IFile[] | undefined;
    if (payload.images && payload.images.length > 0) {
      imageKeys = await this.processPackageImages(payload.images);
    }
    const { categoryId, images, ...restPayload } = payload;

    const newPackage = await this._basePackageRepository.create({
      ...restPayload,
      vendorId: vendorObjectId,
      ...(categoryObjectId && { categoryId: categoryObjectId }),
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

    const { categoryId, ...restPayload } = payload;
    let categoryObjectId: Types.ObjectId | undefined;

    if (categoryId) {
      const category = await this._categoryRepository.findById(categoryId);
      if (!category) {
        throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }
      if (!category.isActive) {
        throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_ACTIVE, HTTP_STATUS.BAD_REQUEST);
      }
      categoryObjectId = toObjectId(categoryId);
    }

    let imageKeys: IFile[] | undefined;

    if (payload.images) {
      imageKeys = await this.processPackageImages(payload.images);
    }

    await this._basePackageRepository.findOneAndUpdate(
      { _id: packageObjectId },
      {
        ...restPayload,
        ...(categoryObjectId && { categoryId: categoryObjectId }),
        ...(imageKeys && { images: imageKeys }),
      },
    );
  }
  //========================================================================
  async fetchPackageScheduleContext(
    vendorId: string,
    packageId: string,
  ): Promise<PackageScheduleContextResponseDTO> {
    const vendorObjectId = toObjectId(vendorId);
    const packageObjectId = toObjectId(packageId);

    const pkg = await this._basePackageRepository.findOnePopulated<IBasePackagePopulated>(
      {
        _id: packageObjectId,
        vendorId: vendorObjectId,
      },
      { path: 'categoryId', select: 'name' },
    );

    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (pkg.status !== PACKAGE_STATUS.PUBLISHED) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_PUBLISHED, HTTP_STATUS.BAD_REQUEST);
    }

    return PackageMapper.toScheduleContext(pkg);
  }

  // delete
  async deletePackage(packageId: string, vendorId: string): Promise<void> {
    const packageObjectId = toObjectId(packageId);

  const isPackageExist = await this._basePackageRepository.findOne({_id:packageObjectId})

  if (!isPackageExist) {
    throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    };
   
    
    const isScheduleExists = await this._scheduleRepository.findOne({ packageId: packageObjectId, status: SCHEDULE_STATUS.UPCOMING });
    
    if (isScheduleExists) {
       throw new AppError(ERROR_MESSAGES.PACKAGE_HAS_ACTIVE_SCHEDULE, HTTP_STATUS.BAD_REQUEST);
    }
    
    const data = await this._basePackageRepository.softDelete(packageObjectId, vendorId);
  
    if (!data) {
   throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    };

  };
}
