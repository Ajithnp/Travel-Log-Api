import { inject, injectable } from 'tsyringe';
import {
  IAdminVendorPackageOversightService,
  PackagesOversightResponseDTO,
} from '../../interfaces/service_interfaces/admin/IAdminVendorPackageService';
import { IBasePackageRepository } from '../../interfaces/repository_interfaces/IBasePackageRepository';
import { PACKAGE_STATUS } from '../../shared/constants/constants';

@injectable()
export class AdminVendorPackageOversightService implements IAdminVendorPackageOversightService {
  constructor(
    @inject('IBasePackageRepository')
    private _basePackageRepository: IBasePackageRepository,
  ) {}

  async getPackages(
    page: number,
    limit: number,
    search?: string,
  ): Promise<PackagesOversightResponseDTO> {
    const [{ packages, total }, totalPublished] = await Promise.all([
      this._basePackageRepository.getAdminPackagesOversight(page, limit, search),
      this._basePackageRepository.countDocuments({ status: PACKAGE_STATUS.PUBLISHED, isDeleted: false }),
    ]);

    return {
      data: packages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalDocs: total,
      totalPublished,
    };
  }
}