import { AppError } from '../../errors/AppError';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { IPublicPackageService } from '../../interfaces/service_interfaces/user/IPublicPackageService';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { injectable, inject } from 'tsyringe';
import { PackageSortOption, PublicPackageFilters } from '../../types/db';
import logger from '../../config/logger';
import { PublicPackageQuery } from 'validators/public-package.validation';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import { CategoryMapper } from '../../shared/mappers/category.mapper';
import { ActiveCategoriesResponseDTO } from '../../types/dtos/vendor/response.dtos';
import { PublicPackageListResponse } from '../../types/dtos/user/response.dtos';
import { PackageMapper } from '../../shared/mappers/package.mapper';

@injectable()
export class PublicPackageService implements IPublicPackageService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
  ) {}

  async getPublicPackages(query: PublicPackageQuery): Promise<PublicPackageListResponse> {
    const filters: PublicPackageFilters = {
      search: query.search,
      category: query.category,
      difficulty: query.difficulty,
      minDuration: query.minDuration,
      maxDuration: query.maxDuration,
      startDate: query.startDate,
      endDate: query.endDate,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minRating: query.minRating,
      sort: query.sort,
      page: query.page,
      limit: query.limit,
    };

    const { packages, total } = await this._basePackageRepository.findPublicPackages(filters);

    return {
      packages: packages.map((p) => PackageMapper.toPublicListing(p)),
      total,
      currentPage: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
      hasNextPage: filters.page < Math.ceil(total / filters.limit),
      hasPreviousPage: filters.page > 1,
    };
  }

  async getCategories(): Promise<ActiveCategoriesResponseDTO[]> {
    const categoriesDoc = await this._categoryRepository.findActiveCategories();

    return categoriesDoc.map(CategoryMapper.toActiveCategoriesResponse);
  }
}
