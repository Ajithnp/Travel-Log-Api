import { ICreateCategoryInputDTO } from '.../../types/dtos/admin/request.dtos';

export interface IAdminCategoryService {
  createCategory(adminId: string, categoryData: ICreateCategoryInputDTO): Promise<void>;
}
