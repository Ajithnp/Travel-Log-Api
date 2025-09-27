import { IVendorInfo } from 'types/IVendor';
import { IBaseRepository } from './IBaseRepository';
import { FilterQuery, Types } from 'mongoose';
import { IVendorInfoResponseDTO } from '../../dtos/vendor/vendor.info.response.dtos';
import { IUser } from '../../types/IUser';
import { IVendorLeanDoc } from '../../repositories/vendor.info.repository';

export interface IVendorInfoRepository extends IBaseRepository<IVendorInfo> {
   
     findByUserId(id:string):Promise<IVendorLeanDoc | null>
     findVendorsVerificationDetails(filter?: FilterQuery<IVendorInfo>, options?: {skip?: number; limit?: number; sort?: any}):Promise<IVendorLeanDoc[]> ;
}