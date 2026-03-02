import { inject, injectable } from 'tsyringe';
import {
  IAdminCategoryService,
  ReviewInput,
} from '../../interfaces/service_interfaces/admin/ICategoryService';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import {
  ICreateCategoryInputDTO,
  IUpdateCategoryInputDTO,
} from '.../../types/dtos/admin/request.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { generateSlug } from '../../shared/utils/slug.generator.helper';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import {
  APPROVE_REJECT_ACTIONS,
  CATEGORY_STATUS,
  CategoryStatus,
} from '../../shared/constants/constants';
import { PaginatedCategoryResponse, PaginatedData } from '../../types/common/IPaginationResponse';
import { CategoryFilters } from '../../types/db';
import {
  CategoryRequestResponseDTO,
  CategoryResponseDTO,
  CategoryRequestReviewedResponseDTO,
} from '../../types/dtos/admin/response.dtos';
import { ICategory, ICategoryRequestPopulated } from '../../types/entities/category.entity';

@injectable()
export class CategoryService implements IAdminCategoryService {
  constructor(
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
  ) {}

  private toResponse(cat: ICategory): CategoryResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? null,
      icon: cat.icon ?? null,
      isActive: cat.isActive,
      status: cat.status,
      createdBy: cat.createdBy?.toString() ?? null,
      requestedBy: cat.requestedBy?.toString() ?? null,
      rejectionReason: cat.rejectionReason ?? null,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    };
  }

  private toRequestResponse(cat: ICategoryRequestPopulated): CategoryRequestResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      requested: cat.requestedBy
        ? {
            name: cat.requestedBy.name,
            email: cat.requestedBy.email,
          }
        : null,
      vendorNote: cat.vendorNote ?? null,
      date: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(cat.createdAt),
      status: cat.status,
    };
  }

  private toRequestReviwedResponse(
    cat: ICategoryRequestPopulated,
  ): CategoryRequestReviewedResponseDTO {
    return {
      id: cat._id.toString(),
      name: cat.name,
      requested: cat.requestedBy
        ? {
            name: cat.requestedBy.name,
            email: cat.requestedBy.email,
          }
        : null,
      adminNote: cat.adminNote ?? null,
      updatedDate: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(cat.updatedAt),
      status: cat.status,
    };
  }

  async createCategory(adminId: string, data: ICreateCategoryInputDTO): Promise<void> {
    const adminObjectId = toObjectId(adminId);

    const existing = await this._categoryRepository.findByName(data.name);
    if (existing) {
      throw new AppError(`A category named "${data.name}" already exists`, HTTP_STATUS.CONFLICT);
    }

    const slug = generateSlug(data.name);

    await this._categoryRepository.create({
      ...data,
      slug,
      isActive: true,
      status: CATEGORY_STATUS.ACTIVE,
      createdBy: adminObjectId,
    });
  }

  async updateCategory(adminId: string, id: string, data: IUpdateCategoryInputDTO): Promise<void> {
    const category = await this._categoryRepository.findById(id);
    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      category.status === CATEGORY_STATUS.PENDING ||
      category.status === CATEGORY_STATUS.REJECTED
    ) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_CANNOT_EDIT, HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await this._categoryRepository.findByIdAndUpdate(id, data);
    if (!updated)
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  async toggleCategoryStatus(id: string): Promise<boolean> {
    const category = await this._categoryRepository.findById(id);
    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      category.status === CATEGORY_STATUS.PENDING ||
      category.status === CATEGORY_STATUS.REJECTED
    ) {
      throw new AppError(ERROR_MESSAGES.CANNOT_TOGGLE, HTTP_STATUS.BAD_REQUEST);
    }
    const newIsActive = !category.isActive;
    const newStatus = newIsActive ? CATEGORY_STATUS.ACTIVE : CATEGORY_STATUS.INACTIVE;

    await this._categoryRepository.toggleStatus(id, newIsActive, newStatus);

    return newIsActive;
  }

  async getAllCategories(filters: CategoryFilters): Promise<PaginatedCategoryResponse> {
    const invalidStatuses = new Set<CategoryStatus>([
      CATEGORY_STATUS.ACTIVE,
      CATEGORY_STATUS.INACTIVE,
    ]);

    if (filters.status && !invalidStatuses.has(filters.status)) {
      throw new AppError(`Filter by '${filters.status}' is not permitted`, HTTP_STATUS.BAD_REQUEST);
    }
    const data = await this._categoryRepository.findAllCategory({
      ...filters,
    });

    return {
      data: data.categories.map(this.toResponse.bind(this)),
      totalDocs: data.total,
      currentPage: filters.page,
      totalPages: Math.ceil(data.total / filters.limit),
      stats: data.stats,
    };
  }

  async getPendingRequests(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PaginatedData<CategoryRequestResponseDTO>> {
    const { requests, total } = await this._categoryRepository.findPendingRequests(
      page,
      limit,
      search,
    );
    return {
      data: requests.map(this.toRequestResponse.bind(this)),
      totalDocs: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async reviewCategoryRequest(adminId: string, id: string, data: ReviewInput): Promise<void> {
    const category = await this._categoryRepository.findById(id);

    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_REQUEST_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (category.status !== CATEGORY_STATUS.PENDING) {
      throw new AppError(
        `This request has already been ${category.status}. Cannot review again.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (data.action === APPROVE_REJECT_ACTIONS.APPROVE) {
      const duplicate = await this._categoryRepository.findByName(category.name);
      if (duplicate && duplicate._id.toString() !== id) {
        throw new AppError(
          `An active category named "${category.name}" already exists. ` +
            `Reject this request and inform the vendor.`,
          HTTP_STATUS.CONFLICT,
        );
      }

      const slug = generateSlug(category.name);

      const approved = await this._categoryRepository.reviewRequest(id, {
        status: CATEGORY_STATUS.ACTIVE,
        slug,
        isActive: true,
        adminId,
      });
      return;
    }

    const rejected = await this._categoryRepository.reviewRequest(id, {
      status: CATEGORY_STATUS.REJECTED,
      isActive: false,
      adminId,
      rejectionReason: data.rejectionReason!.trim(),
    });
  }

  async getReviewedRequests(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<CategoryRequestReviewedResponseDTO>> {
    const { requests, total } = await this._categoryRepository.findReviewedRequest(
      page,
      limit,
      search,
      selectedFilter,
    );
    return {
      data: requests.map(this.toRequestReviwedResponse.bind(this)),
      totalDocs: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
