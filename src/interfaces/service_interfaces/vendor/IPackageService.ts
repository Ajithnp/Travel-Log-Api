import { PaginatedData } from 'types/common/IPaginationResponse';
import {
  BasePackageResponseDTO,
  CreateBasePackageDTO,
} from 'validators/vendor/package/base-package.schema';
import { BasePackageSingleResponseDTO } from '../../../types/dtos/admin/response.dtos';

export interface IPackageService {
  fetchPackages(
    vendorId: string,
    page: number,
    limit: number,
    search?: string,
    selectedFilter?: string,
  ): Promise<PaginatedData<BasePackageSingleResponseDTO>>;
  createPackage(vendorId: string, payload: CreateBasePackageDTO): Promise<{ packageId: string }>;
  updatePackage(vendorId: string, packageId: string, payload: CreateBasePackageDTO): Promise<void>;
  fetchPackagesWithId(vendorId: string, packageId: string): Promise<BasePackageResponseDTO>;
}
