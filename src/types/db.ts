import { CategoryStatus } from '../shared/constants/constants';
import { ICategory } from './entities/category.entity';
import { CategoryStats } from './type';

export interface MongoNumberRange {
  $gte?: number;
  $lte?: number;
}

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
  total: number;
}

export type PackageSortOption = 'price_low_high' | 'price_high_low' | 'newest' | 'top_rated';

export interface PublicPackageFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  minDuration?: number;
  maxDuration?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  startDate?: string;
  endDate?: string;
  sort?: PackageSortOption;
  page: number;
  limit: number;
}
