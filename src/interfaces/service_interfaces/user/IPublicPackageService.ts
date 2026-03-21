import { PublicPackageQuery } from '../../../validators/public-package.validation';
import { ActiveCategoriesResponseDTO } from '../../../types/dtos/vendor/response.dtos';
import {
  PublicPackageDetailDTO,
  PublicPackageListResponse,
} from '../../../types/dtos/user/response.dtos';

export interface IPublicPackageService {
  getPublicPackages(filters: PublicPackageQuery): Promise<PublicPackageListResponse>;
  getCategories(): Promise<ActiveCategoriesResponseDTO[]>;
  getPackageDetails(packageId: string): Promise<PublicPackageDetailDTO>;
}
