import { IVendor } from 'types/IVendor';
import { IBaseRepository } from './IBaseRepository';
import { FilterQuery, Types } from 'mongoose';
import { IVendorInfoResponseDTO } from '../../dtos/vendor/vendor.info.response.dtos';
import { IUser } from '../../types/IUser';



export interface IVendorInfoRepository extends IBaseRepository<IVendor> {
  
      findVendorsVerificationDetails(filter?: FilterQuery<IVendor>, options?: {skip?: number; limit?: number; sort?: any}):Promise<(IVendor & { userId: IUser| Types.ObjectId})[]> ;
    
}