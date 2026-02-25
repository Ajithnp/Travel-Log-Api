import { inject, injectable } from 'tsyringe';
import { IAdminCategoryService } from '../../interfaces/service_interfaces/admin/ICategoryService';
import { ICategoryRepository } from '../../interfaces/repository_interfaces/ICategoryRepository';

@injectable()
export class CategoryService implements IAdminCategoryService {
    constructor(
        @inject('ICategoryRepository')
        private _categoryRepository: ICategoryRepository,
    
    ) { }
    
    
}