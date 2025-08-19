import { IVendor } from 'types/IVendor';
import { IBaseRepository } from './IBaseRepository';
import { FilterQuery, Types } from 'mongoose';
import { IVendorInfoResponseDTO } from '../../dtos/vendor/vendor.info.response.dtos';
import { IUser } from '../../types/IUser';
import { IVendorLeanDoc } from '../../repositories/vendor.info.repository';


// export interface IVendorInfoRepository extends IBaseRepository<IVendor> {
  
//       findVendorsVerificationDetails(filter?: FilterQuery<IVendor>, options?: {skip?: number; limit?: number; sort?: any}):Promise<(IVendor & { userId: IUser| Types.ObjectId})[]> ;
    
// }

export interface IVendorInfoRepository extends IBaseRepository<IVendor> {
     // Change the return type to IVendorLeanDoc[]
     findVendorsVerificationDetails(filter?: FilterQuery<IVendor>, options?: {skip?: number; limit?: number; sort?: any}):Promise<IVendorLeanDoc[]> ;
}