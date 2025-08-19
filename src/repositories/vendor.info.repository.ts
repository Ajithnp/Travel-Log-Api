import { injectable } from "tsyringe";
import { VendorInformationModel } from "../models/vendor.information.model";
import { BaseRepository } from "./base.repository";
import { IVendorInfoRepository } from "interfaces/repository_interfaces/IVendorInfoRepository";
import { USER_ROLES } from "../shared/constants/roles";
import { IVendor } from "types/IVendor";
import { IVendorInfoResponseDTO } from "../dtos/vendor/vendor.info.response.dtos";
import { FilterQuery, Types, HydratedDocument } from "mongoose";
import { IUser } from "../types/IUser";

@injectable()
export class VendorInfoRepository extends BaseRepository<IVendor> implements IVendorInfoRepository {

    constructor() {
        super(VendorInformationModel);
    }

    async findVendorsVerificationDetails(filter: FilterQuery<IVendor> = {}, options?: { skip?: number; limit?: number; sort?: any; }): Promise<(IVendor & { userId: IUser | Types.ObjectId })[]> {
        return await VendorInformationModel.find(
            filter,
            null,
            options
            ).populate<{ userId: HydratedDocument<IUser> }>("userId", "id name email phone createdAt").lean().exec() 
    }

    

    // async findUsers(): Promise <IUser [] | null> {
    //     return await UserModel.find({role: USER_ROLES.USER}).exec();
    // };
    
    // async getDocsCount(role?:string): Promise<number> {
    //     return await UserModel.countDocuments({role}).exec();
    // };

    
 
}