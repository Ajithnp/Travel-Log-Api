import { ICategoryRepository } from "interfaces/repository_interfaces/ICategoryRepository";
import { IVendorCategoryService } from "interfaces/service_interfaces/vendor/ICategoryService";
import { inject , injectable} from "tsyringe";
import { PaginatedData } from "types/common/IPaginationResponse";
import { FilterType } from "types/db";
import { VendorRequestedCategoryResponseDTO } from "types/dtos/vendor/response.dtos";
import { ICategory } from "types/entities/category.entity";

@injectable()
export class VendorCategoryService implements IVendorCategoryService{
         constructor(
           @inject('ICategoryRepository')
           private _categoryRepository: ICategoryRepository,
    ) { }
    
      private toVendorRequestCategoryResponse(
        cat: ICategory,
      ): VendorRequestedCategoryResponseDTO {
        return {
          id: cat._id.toString(),
          name: cat.name,
          adminNote: cat.adminNote ?? null,
          note: cat.vendorNote ?? null,
          createdAt: new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }).format(cat.updatedAt),
          status: cat.status,
        };
    }
    
      async getRequestedcategories(vendorId:string,filters: FilterType): Promise<PaginatedData<VendorRequestedCategoryResponseDTO>> {
    const { data, total } = await this._categoryRepository.findVendorCategory(vendorId, filters);

    return {
      data: data.map(this.toVendorRequestCategoryResponse.bind(this)),
      totalDocs: total,
      currentPage: filters.page,
      totalPages:  Math.ceil(total / filters.limit)
    }


  }
}