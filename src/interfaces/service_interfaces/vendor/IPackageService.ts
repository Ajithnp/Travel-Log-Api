import { PaginatedData } from 'types/common/IPaginationResponse';
import {
  BasePackageResponseDTO,
  CreateBasePackageDTO,
} from 'validators/vendor/package/base-package.schema';
import { BasePackageSingleResponseDTO, PackageDetailDTO } from '../../../types/dtos/admin/response.dtos';
import { FilterType } from 'types/db';

export interface IPackageService {
  fetchPackages(
    vendorId: string,
    filters: FilterType,
  ): Promise<PaginatedData<BasePackageSingleResponseDTO>>;
  createPackage(vendorId: string, payload: CreateBasePackageDTO): Promise<{ packageId: string }>;
  updatePackage(vendorId: string, packageId: string, payload: CreateBasePackageDTO): Promise<void>;
  fetchPackagesWithId(vendorId: string, packageId: string): Promise<PackageDetailDTO>;
}
