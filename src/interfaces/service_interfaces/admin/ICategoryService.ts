import {
  ICreateCategoryInputDTO,
  IUpdateCategoryInputDTO,
} from '.../../types/dtos/admin/request.dtos';
import {
  PaginatedCategoryResponse,
  PaginatedData,
} from '../../../types/common/IPaginationResponse';
import { CategoryFilters } from '../../../types/db';
import {
  CategoryRequestResponseDTO,
  CategoryResponseDTO,
} from '../../../types/dtos/admin/response.dtos';

export interface IAdminCategoryService {
  createCategory(adminId: string, categoryData: ICreateCategoryInputDTO): Promise<void>;
  updateCategory(adminId: string, id: string, data: IUpdateCategoryInputDTO): Promise<void>;
  toggleCategoryStatus(id: string): Promise<boolean>;
  getAllCategories(filters: CategoryFilters): Promise<PaginatedCategoryResponse>;
  getPendingRequests(
    page: number,
    limit: number,
  ): Promise<PaginatedData<CategoryRequestResponseDTO>>;
}
