import { injectable, inject } from 'tsyringe';
import { IVendorRevenueService, PackagesEarningsByVendor } from '../../interfaces/service_interfaces/vendor/IVendorRevenueService';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { PaginatedData } from '../../types/common/IPaginationResponse';

@injectable()
export class VendorRevenueService implements IVendorRevenueService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
  ) {}

  async packagesEarningOverview(vendorId: string, page: number, limit: number, search?: string):Promise<PaginatedData<PackagesEarningsByVendor>> {
    const result = await this._basePackageRepository.getPackagesEarningOverviewByVendor(vendorId, page, limit, search);
    return result;
  }
}
