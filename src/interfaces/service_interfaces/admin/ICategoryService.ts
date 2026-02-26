import {
  ICreateCategoryInputDTO,
  IUpdateCategoryInputDTO,
} from '.../../types/dtos/admin/request.dtos';

export interface IAdminCategoryService {
  createCategory(adminId: string, categoryData: ICreateCategoryInputDTO): Promise<void>;
  updateCategory(adminId: string, id: string, data: IUpdateCategoryInputDTO): Promise<void>;
  toggleCategoryStatus(id: string): Promise<boolean>;
}
