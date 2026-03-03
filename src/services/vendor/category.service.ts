import { inject, injectable } from 'tsyringe';
import { AppError } from '../../errors/AppError';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import { IVendorCategoryService } from '../../interfaces/service_interfaces/vendor/ICategoryService';
import mongoose from 'mongoose';
import { CATEGORY_STATUS } from '../../shared/constants/constants';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { PaginatedData } from '../../types/common/IPaginationResponse';
import { FilterType } from '../../types/db';
import { VendorCategoryRequestInputDTO } from '../../types/dtos/vendor/request.dtos';
import { VendorRequestedCategoryResponseDTO } from '../../types/dtos/vendor/response.dtos';
import { generateSlug } from '../../shared/utils/slug.generator.helper';
import { CategoryMapper } from '../../shared/mappers/category.mapper';
@injectable()
export class VendorCategoryService implements IVendorCategoryService {
  private MAX_VENDOR_PENDING_REQUESTS: number = 3;

  constructor(
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
  ) {}

  async getRequestedcategories(
    vendorId: string,
    filters: FilterType,
  ): Promise<PaginatedData<VendorRequestedCategoryResponseDTO>> {
    const { data, total } = await this._categoryRepository.findVendorCategory(vendorId, filters);

    return {
      data: data.map(CategoryMapper.toVendorRequestResponse),
      totalDocs: total,
      currentPage: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async requestCategory(vendorId: string, data: VendorCategoryRequestInputDTO): Promise<void> {
    const name = data.name.trim();

    const activeExisting = await this._categoryRepository.findByName(name);
    if (activeExisting && activeExisting.status === CATEGORY_STATUS.ACTIVE) {
      throw new AppError(
        `The category "${name}" already exists. You can select it from the dropdown.`,
        HTTP_STATUS.CONFLICT,
      );
    }
    // Check if THIS vendor already requested this name (any status)
    const duplicateRequest = await this._categoryRepository.findDuplicateRequest(vendorId, name);

    if (duplicateRequest) {
      const statusMsg =
        duplicateRequest.status === CATEGORY_STATUS.PENDING
          ? 'is currently pending admin review'
          : duplicateRequest.status === CATEGORY_STATUS.REJECTED
            ? 'was previously rejected'
            : 'already exists';

      throw new AppError(
        `You already requested a category named "${name}" — it ${statusMsg}.`,
        HTTP_STATUS.CONFLICT,
      );
    }

    // max 3 pending requests per vendor
    const pendingCount = await this._categoryRepository.countPendingByVendor(vendorId);
    if (pendingCount >= this.MAX_VENDOR_PENDING_REQUESTS) {
      throw new AppError(
        `You have ${pendingCount} pending category requests. ` +
          `Wait for admin review before submitting more.`,
        HTTP_STATUS.TOO_MANY_REQUESTS,
      );
    }

    const slug = generateSlug(data.name);
    const slugExist = await this._categoryRepository.findBySlug(slug);
    if (slugExist) {
      throw new AppError(
        `Your requested  category named "${slugExist.name}" is already exist.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await this._categoryRepository.create({
      name,
      vendorNote: data.vendorNote,
      requestedBy: new mongoose.Types.ObjectId(vendorId),
    });
  }

  async getActiveCategories(): Promise<string[]> {
    const categories = await this._categoryRepository.findActiveCategories();
    return categories.map((cat) => cat.name);
  }
}
