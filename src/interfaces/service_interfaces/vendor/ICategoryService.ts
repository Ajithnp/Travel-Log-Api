import { PaginatedData } from 'types/common/IPaginationResponse';
import { FilterType } from 'types/db';
import { VendorCategoryRequestInputDTO } from 'types/dtos/vendor/request.dtos';
import {
  ActiveCategoriesResponseDTO,
  VendorRequestedCategoryResponseDTO,
} from 'types/dtos/vendor/response.dtos';

export interface IVendorCategoryService {
  getRequestedcategories(
    vendorId: string,
    filters: FilterType,
  ): Promise<PaginatedData<VendorRequestedCategoryResponseDTO>>;
  getActiveCategories(): Promise<ActiveCategoriesResponseDTO[]>;

  requestCategory(vendorId: string, data: VendorCategoryRequestInputDTO): Promise<void>;
}
