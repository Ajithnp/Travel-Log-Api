import { inject, injectable } from 'tsyringe';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import { ICreateCategoryInputDTO } from '.../../types/dtos/admin/request.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { generateSlug } from '../../shared/utils/slug.generator.helper';
import { toObjectId } from '../../shared/utils/database/objectId.helper';

@injectable()
export class CategoryService implements IAdminCategoryService {
  constructor(
    @inject('ICategoryRepository')
    private _categoryRepository: ICategoryRepository,
  ) {}

  async createCategory(adminId: string, data: ICreateCategoryInputDTO): Promise<void> {
    const adminObjectId = toObjectId(adminId);
      
    const existing = await this._categoryRepository.findByName(data.name);
    if (existing) {
      throw new AppError(`A category named "${data.name}" already exists`, HTTP_STATUS.CONFLICT);
    }

    const slug = generateSlug(data.name);

    await this._categoryRepository.create({
      ...data,
      slug,
      createdBy: adminObjectId,
    });
  }
}
