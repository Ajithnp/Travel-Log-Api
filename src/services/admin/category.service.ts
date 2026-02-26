import { inject, injectable } from 'tsyringe';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';
import {
  ICreateCategoryInputDTO,
  IUpdateCategoryInputDTO,
} from '.../../types/dtos/admin/request.dtos';
import { AppError } from '../../errors/AppError';
import { HTTP_STATUS } from '../../shared/constants/http_status_code';
import { generateSlug } from '../../shared/utils/slug.generator.helper';
import { toObjectId } from '../../shared/utils/database/objectId.helper';
import { ERROR_MESSAGES } from '../../shared/constants/messages';
import { CATEGORY_STATUS } from '../../shared/constants/constants';

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
      isActive: true,
      status: CATEGORY_STATUS.ACTIVE,
      createdBy: adminObjectId,
    });
  }

  async updateCategory(adminId: string, id: string, data: IUpdateCategoryInputDTO): Promise<void> {
    const category = await this._categoryRepository.findById(id);
    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      category.status === CATEGORY_STATUS.PENDING ||
      category.status === CATEGORY_STATUS.REJECTED
    ) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_CANNOT_EDIT, HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await this._categoryRepository.findByIdAndUpdate(id, data);
    if (!updated)
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  async toggleCategoryStatus(id: string): Promise<boolean> {
    const category = await this._categoryRepository.findById(id);
    if (!category) {
      throw new AppError(ERROR_MESSAGES.CATEGORY_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (
      category.status === CATEGORY_STATUS.PENDING ||
      category.status === CATEGORY_STATUS.REJECTED
    ) {
      throw new AppError(ERROR_MESSAGES.CANNOT_TOGGLE, HTTP_STATUS.BAD_REQUEST);
    }
    const newIsActive = !category.isActive;
    const newStatus = newIsActive ? CATEGORY_STATUS.ACTIVE : CATEGORY_STATUS.INACTIVE;

    await this._categoryRepository.toggleStatus(id, newIsActive, newStatus);

    return newIsActive;
  }
}
