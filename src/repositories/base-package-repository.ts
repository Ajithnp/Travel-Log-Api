import { injectable } from 'tsyringe';
import { IBasePackageRepository } from '../interfaces/repository_interfaces/IBasePackageRepository';
import { BaseRepository } from './base.repository';
import { IBasePackageEntity } from '../types/entities/base-package.entity';
import { PackageModel } from '../models/package.model';

@injectable()
export class BasePackageRepository
  extends BaseRepository<IBasePackageEntity>
  implements IBasePackageRepository
{
  constructor() {
    super(PackageModel);
  }
}
