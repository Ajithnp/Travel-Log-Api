import { AppError } from '../../errors/AppError';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { IPublicPackageService, PopularPackagesResponseDTO, RecommendedPackagesResponseDTO } from '../../interfaces/service_interfaces/user/IPublicPackageService';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { injectable, inject } from 'tsyringe';
import { PublicPackageFilters } from '../../types/db';
import { PublicPackageQuery } from '../../validators/public-package.validation';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import { CategoryMapper } from '../../shared/mappers/category.mapper';
import { ActiveCategoriesResponseDTO } from '../../types/dtos/vendor/response.dtos';
import {
  PublicPackageDetailDTO,
  PublicPackageListResponse,
  PublicScheduleDTO,
} from '../../types/dtos/user/response.dtos';
import { PackageMapper } from '../../shared/mappers/package.mapper';
import { IPopulatedPackageDetails } from '../../types/entities/base-package.entity';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { ISchedulePackageRepository } from '../../interfaces/repository_interfaces/ISchedulePackage';
import { ScheduleMapper } from '../../shared/mappers/schedule.mapper';
import { IOfferRepository } from '../../interfaces/repository_interfaces/IOfferRepository';
import { IUserRepository } from '../../interfaces/repository_interfaces/IUserRepository';
import { IBookingRepository } from '../../interfaces/repository_interfaces/IBookingRepository';
import { ICacheService } from '../../interfaces/service_interfaces/ICacheService';
import { CACHE_KEYS, CACHE_TTL } from '../../types/cache';

@injectable()
export class PublicPackageService implements IPublicPackageService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
    @inject('ISchedulePackageRepository')
    private _schedulePackageRepository: ISchedulePackageRepository,
    @inject('IOfferRepository')
    private _offerRepository: IOfferRepository,
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('ICacheService')
    private _cacheService: ICacheService,
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

  async getPackageDetails(packageId: string): Promise<PublicPackageDetailDTO> {
    const pkg = await this._basePackageRepository.findOnePopulatedMany<IPopulatedPackageDetails>(
      { _id: packageId },
      [
        { path: 'vendorId', select: '_id name' },
        { path: 'categoryId', select: 'name slug' },
        { path: 'cancellationPolicy', select: 'key label description rules' },
      ],
    );

    if (!pkg) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    const hasOffer = await this._offerRepository.hasActiveOfferByPackage(packageId);

    const packageDetails = PackageMapper.toPublicDetailResponse({
      ...pkg,
      vendorId: pkg.vendorId,
      categoryId: pkg.categoryId,
    });

    packageDetails.offerId = hasOffer.offerId;
    packageDetails.offerPercentage = hasOffer.offerPercentage;
    packageDetails.hasOffer = hasOffer.hasOffer;

    return packageDetails;
  }

  async getPublicSchedulesByPackage(packageId: string): Promise<PublicScheduleDTO[]> {
    
    const cacheKey = CACHE_KEYS.publicScheduleByPackage(packageId);
    
    const cached = await this._cacheService.get<PublicScheduleDTO[]>(cacheKey);
   
    if (cached) return cached;
    
    const schedules = await this._schedulePackageRepository.findPublicSchedulesByPackage(packageId);

    if (!schedules) {
      throw new AppError(ERROR_MESSAGES.PACKAGE_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }
    const data = schedules.map((schedule) => ScheduleMapper.toPublicSchedule(schedule));
    await this._cacheService.set(cacheKey, data, CACHE_TTL.ttl_5_minutes);

    return data;
  }

  async getPopularPackages(): Promise<PopularPackagesResponseDTO[]> {
    const cacheKey = CACHE_KEYS.popularPackages;

    const cached = await this._cacheService.get<PopularPackagesResponseDTO[]>(cacheKey);
    if (cached) return cached;

    const packages = await this._basePackageRepository.findPopularPackages();

    await this._cacheService.set(cacheKey, packages, CACHE_TTL.ttl_30_minutes);

    return packages;
  };

  async getRecommendedPackages(userId?:string):Promise<RecommendedPackagesResponseDTO[]>{
    
    if(!userId){
      const cacheKey = CACHE_KEYS.recommendedPackagesGuest;

      const cached = await this._cacheService.get<RecommendedPackagesResponseDTO[]>(cacheKey);
      if (cached) return cached;

      const data = await this._basePackageRepository.topRatedPackages();
      await this._cacheService.set(cacheKey, data, CACHE_TTL.ttl_30_minutes);
      
      return data;
    };
    
    const cacheKey = CACHE_KEYS.recommendedPackages(userId);
    const cached = await this._cacheService.get<RecommendedPackagesResponseDTO[]>(cacheKey);

    if (cached) return cached;

    const user = await this._userRepository.findById(userId);

    if(!user){
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    };

    const bookingsMeta = await this._bookingRepository.findUserBookingsMeta(userId);
  
    let data: RecommendedPackagesResponseDTO[];

    if(bookingsMeta.totalBookings === 0){
      data = await this._basePackageRepository.topRatedPackages();
    }else{
      data = await this._basePackageRepository.getPersonalizedPackagesByUserId(bookingsMeta);
    }

    await this._cacheService.set(cacheKey, data, CACHE_TTL.ttl_30_minutes);
    return data; 
   }
}
