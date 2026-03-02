
import { PaginatedData } from "types/common/IPaginationResponse"
import { FilterType } from "types/db"
import { VendorRequestedCategoryResponseDTO } from "types/dtos/vendor/response.dtos"


export interface IVendorCategoryService {
    getRequestedcategories(vendorId:string, filters:FilterType):Promise<PaginatedData<VendorRequestedCategoryResponseDTO>>
}