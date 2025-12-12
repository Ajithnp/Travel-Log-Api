import {
  IVendorInfo,
  IVendorInfoWithUser,
  IVendorInfoPopulated,
} from '../../types/entities/vendor.info.entity';
import { IBaseRepository } from './IBaseRepository';
import { FilterQuery } from 'mongoose';
import { CustomQueryOptions } from '../../types/common/IQueryOptions';
import { IUser } from '../../types/entities/user.entity';
export interface IVendorInfoRepository extends IBaseRepository<IVendorInfo> {
  findVendorWithUserId(userId: string): Promise<IVendorInfoPopulated | null>;

  findVendors(
    vendorSearchQuery: FilterQuery<IUser>,
    vendorFilter: FilterQuery<IUser>,
    options?: CustomQueryOptions,
  ): Promise<IVendorInfoWithUser[]>;

  countVendorDocuments(
    vendorSearchQuery?: FilterQuery<IUser>,
    vendorFilter?: FilterQuery<IVendorInfo>,
    matchQuery?: FilterQuery<IVendorInfo>,
  ): Promise<number>;

  findVendorsVerificationDetails(
    vendorSearchQuery?: FilterQuery<IUser>,
    vendorFilter?: FilterQuery<IVendorInfo>,
    options?: CustomQueryOptions,
  ): Promise<IVendorInfoWithUser[]>;
}
