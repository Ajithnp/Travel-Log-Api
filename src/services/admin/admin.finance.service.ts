import { injectable, inject } from 'tsyringe';
import { CommissionOverview, IAdminFinanceService, PaginatedCommissionOverviewByPackages, PaginatedCommissionOverviewByVendors } from '../../interfaces/service_interfaces/admin/IAdminFinanceService';
import { IBookingRepository } from '../../interfaces/repository_interfaces/IBookingRepository';
import { ICacheService } from '../../interfaces/service_interfaces/ICacheService';
import { CACHE_KEYS, CACHE_TTL } from '../../types/cache';
import { IVendorInfoRepository } from '../../interfaces/repository_interfaces/IVendorInfoRepository';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';


@injectable()
export class AdminFinanceService implements IAdminFinanceService {
  constructor(
    @inject('IBookingRepository')
    private _bookingRepository: IBookingRepository,
    @inject('IVendorInfoRepository')
    private _vendorRepository: IVendorInfoRepository,
    @inject('ICacheService')
    private _cacheService: ICacheService,
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
  ) {}

  async getCommissionOverview(): Promise<CommissionOverview> {
    const cacheKey = CACHE_KEYS.commissionOverview;
    const ttl = CACHE_TTL.ttl_5_minutes;
    const cachedData = await this._cacheService.get<CommissionOverview>(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const data = await this._bookingRepository.getCommissionOverview();
    await this._cacheService.set(cacheKey, data, ttl);
    return data;
  };

  async getCommissionsByVendors(page:number,limit:number,search?:string):Promise<PaginatedCommissionOverviewByVendors>{
    return this._vendorRepository.getCommissionOverviewByVendors(page,limit,search);
  };

  async getCommissionsByVendorsPackages(page:number,limit:number,sortBy:string,search?:string):Promise<PaginatedCommissionOverviewByPackages>{
    const data = await this._basePackageRepository.getCommissionOverviewByPackages(page,limit,sortBy,search);
   
    return data;
  };

}


