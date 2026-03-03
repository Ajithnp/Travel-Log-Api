import { IBaseRepository } from './IBaseRepository';
import { ICategory, ICategoryRequestPopulated } from '../../types/entities/category.entity';
import { CategoryStatus } from '../../shared/constants/constants';
import { CategoryFilters, CategoryFindAllResult, FilterType } from '../../types/db';
import { ReviewRequestDTO } from '../../types/dtos/admin/request.dtos';

export interface ICategoryRepository extends IBaseRepository<ICategory> {
  findByName(name: string): Promise<ICategory | null>;
  findBySlug(slug: string, excludeId?: string): Promise<ICategory | null>;
  toggleStatus(id: string, isActive: boolean, status: CategoryStatus): Promise<ICategory | null>;
  findAllCategory(filters: CategoryFilters): Promise<CategoryFindAllResult>;
  findPendingRequests(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ requests: ICategoryRequestPopulated[]; total: number }>;
  reviewRequest(id: string, data: ReviewRequestDTO): Promise<ICategory | null>;
  findReviewedRequest(
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<{ requests: ICategoryRequestPopulated[]; total: number }>;

  //===== vendor=======
  findVendorCategory(vendorId: string, filter: FilterType): Promise<PaginatedVendorCategoryResult>;
  findActiveCategories(): Promise<ICategory[]>;
  findDuplicateRequest(vendorId: string, name: string): Promise<ICategory | null>;
  countPendingByVendor(vendorId: string): Promise<number>;
}

export interface PaginatedVendorCategoryResult {
  data: ICategory[];
  total: number;
}
