import { IVendorCategoryController } from "../../interfaces/controller_interfaces/vendor/IVendorCategoryController";
import { inject , injectable} from "tsyringe";
import { IVendorCategoryService } from "../../interfaces/service_interfaces/vendor/ICategoryService";
import expressAsyncHandler from "express-async-handler";
import { FilterType } from "../../types/db";
import { getPaginationOptions } from "../../shared/utils/pagination.helper";
import { IApiResponse } from "../../types/common/IApiResponse";
import { HTTP_STATUS, SUCCESS_STATUS } from "../../shared/constants/http_status_code";
import { SUCCESS_MESSAGES } from "../../shared/constants/messages";

@injectable()
export class VendorCategoryController implements IVendorCategoryController {
    constructor(
        @inject('IVendorCategoryService')
        private _vendorCategoryService: IVendorCategoryService,
    ) { }
    
    getVendorsRequestCategories = expressAsyncHandler(async (req, res) => {
      
    const vendorId = req.user?.id!;
    const { page, limit, search, selectedFilter } = getPaginationOptions(req);
    const filters:FilterType = {
      selectedFilter,
      search,
      page,
      limit,
    };

    const result = await this._vendorCategoryService.getRequestedcategories(vendorId,filters);

    const successResponse: IApiResponse<typeof result> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OK,
      data: result,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}