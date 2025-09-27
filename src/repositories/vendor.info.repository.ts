
import { IVendorInfo } from '../types/IVendor';
import { IUser } from '../types/IUser';
import { VendorInformationModel } from '../models/vendor.information.model';
import { FilterQuery, Types } from 'mongoose';
import { IVendorInfoRepository } from 'interfaces/repository_interfaces/IVendorInfoRepository';
import { BaseRepository } from './base.repository';
import { inject,injectable } from 'tsyringe';
import { IVendorInfoResponseDTO } from 'dtos/vendor/vendor.info.response.dtos';


export interface IVendorLeanDoc extends Omit<IVendorInfo, 'userId' | '_id'> {
    _id: Types.ObjectId;
    userId: Pick<IUser, 'name' | 'email' | 'phone' | 'createdAt'> & { _id: Types.ObjectId };
}

@injectable()
export class VendorInfoRepository extends BaseRepository<IVendorInfo> implements IVendorInfoRepository {

    constructor() {
        super(VendorInformationModel);
    }

    async findByUserId(id: string): Promise<IVendorLeanDoc | null> {
        
        return await VendorInformationModel.findOne({ userId:id })
            .populate({
                path: 'userId',
                select: 'name email phone createdAt'
         }).lean<IVendorLeanDoc>().exec()
    }

    public async findVendorsVerificationDetails(
        filter: FilterQuery<IVendorInfo> = {}, 
        options?: { skip?: number; limit?: number; sort?: any }
    ): Promise<IVendorLeanDoc[]> {
        const query = VendorInformationModel.find(filter)
            
            .populate({
                path: 'userId',
                 select: 'name email phone createdAt'
            })
            .lean();

        if (options?.skip) query.skip(options.skip);
        if (options?.limit) query.limit(options.limit);
        if (options?.sort) query.sort(options.sort);
        
        const result = await query.exec();
        return result as unknown as IVendorLeanDoc[];
    }
}