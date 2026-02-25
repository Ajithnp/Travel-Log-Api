
import { inject, injectable } from "tsyringe";
import { IAdminCategoryController } from "../../interfaces/controller_interfaces/admin/IAdminCategoryController";
import { IAdminCategoryService } from "../../interfaces/service_interfaces/admin/ICategoryService";

@injectable()
export class AdminCategoryController implements IAdminCategoryController {
    constructor(
        @inject('IAdminCategoryService')
        private _adminCategoryService: IAdminCategoryService,
    ) { }
    
}