import { CategoryResponseDTO } from '../../types/dtos/admin/response.dtos';
import { CategoryStats } from '../../types/type';

export interface PaginatedData<T> {
  data: T[];
  currentPage?: number;
  totalPages?: number;
  totalDocs?: number;
}

export interface PaginatedCategoryResponse extends PaginatedData<CategoryResponseDTO> {
  stats: CategoryStats;
}
