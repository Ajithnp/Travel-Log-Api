// import { injectable } from "tsyringe";
// import { VendorInformationModel } from "../models/vendor.information.model";
// import { BaseRepository } from "./base.repository";
// import { IVendorInfoRepository } from "interfaces/repository_interfaces/IVendorInfoRepository";
// import { USER_ROLES } from "../shared/constants/roles";
// import { IVendor } from "types/IVendor";
// import { IVendorInfoResponseDTO } from "../dtos/vendor/vendor.info.response.dtos";
// import { FilterQuery, Types, HydratedDocument } from "mongoose";
// import { IUser } from "../types/IUser";


// // interface IVendorLeanDoc extends Omit<IVendor, 'userId'> {
// //     userId: IUser;
// //     _id: Types.ObjectId;
// // }

// export interface IVendorLeanDoc extends Omit<IVendor, 'userId' | '_id'> {
//     _id: Types.ObjectId;
//     userId: Pick<IUser, '_id' | 'id' | 'name' | 'email' | 'phone' | 'createdAt'> & { _id: Types.ObjectId };
// }

// @injectable()
// export class VendorInfoRepository extends BaseRepository<IVendor> implements IVendorInfoRepository {

//     constructor() {
//         super(VendorInformationModel);
//     }

//     // async findVendorsVerificationDetails(filter: FilterQuery<IVendor> = {}, options?: { skip?: number; limit?: number; sort?: any; }): Promise<(IVendor & { userId: IUser | Types.ObjectId })[]> {
//     //     return await VendorInformationModel.find(
//     //         filter,
//     //         null,
//     //         options
//     //         ).populate<{ userId: HydratedDocument<IUser> }>("userId", "id name email phone createdAt").lean().exec() 
//     // }

     

    

//     // async findUsers(): Promise <IUser [] | null> {
//     //     return await UserModel.find({role: USER_ROLES.USER}).exec();
//     // };
    
//     // async getDocsCount(role?:string): Promise<number> {
//     //     return await UserModel.countDocuments({role}).exec();
//     // };

    

    
 
// }

// import { injectable } from "tsyringe";
// import { VendorInformationModel } from "../models/vendor.information.model";
// import { BaseRepository } from "./base.repository";
// import { IVendorInfoRepository } from "interfaces/repository_interfaces/IVendorInfoRepository";
// import { IVendor } from "types/IVendor";
// import { FilterQuery, Types } from "mongoose";
// import { IUser } from "../types/IUser";


// export interface IVendorLeanDoc extends Omit<IVendor, 'userId' | '_id'> {
//     _id: Types.ObjectId;
//     userId: Pick<IUser, 'id' | 'name' | 'email' | 'phone' | 'createdAt'> & { _id: Types.ObjectId };
// }

// @injectable()
// export class VendorInfoRepository extends BaseRepository<IVendor> implements IVendorInfoRepository {

//     constructor() {
//         super(VendorInformationModel);
//     }

//     public async findVendorsVerificationDetails(
//         filter: FilterQuery<IVendor> = {}, 
//         options?: { skip?: number; limit?: number; sort?: any }
//     ): Promise<IVendorLeanDoc[]> {
//         const query = VendorInformationModel.find(filter)
//             .populate<{ userId: Pick<IUser, 'name' | 'email' | 'phone' | 'createdAt'> }>('userId', 'name email phone createdAt')
//             .lean();

//         if (options?.skip) query.skip(options.skip);
//         if (options?.limit) query.limit(options.limit);
//         if (options?.sort) query.sort(options.sort);
        
//         const result = await query.exec();
//         return result as unknown as IVendorLeanDoc[];
//     }
// }


// src/repositories/vendorInfo.repository.ts
import { IVendor } from '../types/IVendor';
import { IUser } from '../types/IUser';
import { VendorInformationModel } from '../models/vendor.information.model';
import { FilterQuery, Types } from 'mongoose';
import { IVendorInfoRepository } from 'interfaces/repository_interfaces/IVendorInfoRepository';
import { BaseRepository } from './base.repository';
import { inject,injectable } from 'tsyringe';

// This interface precisely defines the shape of the object
// returned by a lean() query with populate.
export interface IVendorLeanDoc extends Omit<IVendor, 'userId' | '_id'> {
    _id: Types.ObjectId;
    // The populated user will be a lean object with the selected fields
    userId: Pick<IUser, 'name' | 'email' | 'phone' | 'createdAt'> & { _id: Types.ObjectId };
}

@injectable()
export class VendorInfoRepository extends BaseRepository<IVendor> implements IVendorInfoRepository {

    constructor() {
        super(VendorInformationModel);
    }

    public async findVendorsVerificationDetails(
        filter: FilterQuery<IVendor> = {}, 
        options?: { skip?: number; limit?: number; sort?: any }
    ): Promise<IVendorLeanDoc[]> {
        const query = VendorInformationModel.find(filter)
            // The type parameter for populate must match the fields you are selecting
            .populate<{ userId: Pick<IUser, 'name' | 'email' | 'phone' | 'createdAt'> }>('userId', 'name email phone createdAt')
            .lean();

        if (options?.skip) query.skip(options.skip);
        if (options?.limit) query.limit(options.limit);
        if (options?.sort) query.sort(options.sort);
        
        const result = await query.exec();
        return result as unknown as IVendorLeanDoc[];
    }
}