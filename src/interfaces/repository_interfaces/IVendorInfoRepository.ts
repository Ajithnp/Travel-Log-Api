import { IVendorInfo, IVendorInfoPopulated } from '../../types/entities/vendor.info.entity';
import { IBaseRepository } from './IBaseRepository';
import { FilterQuery } from 'mongoose';
import { CustomQueryOptions } from '../../types/common/IQueryOptions';


export interface IVendorInfoRepository extends IBaseRepository<IVendorInfo> {

  findVendorWithUser(userId: string): Promise<IVendorInfoPopulated | null>;

  findVendorsVerificationDetails(
    filter?: FilterQuery<IVendorInfo>,
    options?: CustomQueryOptions,
  ): Promise<IVendorInfoPopulated[]>;
}
