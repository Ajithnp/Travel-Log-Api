import { CategoryStatus } from '../shared/constants/constants';
import { ICategory } from './entities/category.entity';
import { CategoryStats } from './type';

export interface CategoryFilters {
  status?: CategoryStatus;
  search?: string;
  page: number;
  limit: number;
}

export interface FilterType {
  selectedFilter?: string;
  search?: string;
  page: number;
  limit: number;
  startDate?: string;
  endDate?: string;
}

export interface CategoryFindAllResult {
  categories: ICategory[];
  stats: CategoryStats;
  total: number; // total matching current filters (for pagination)
}
