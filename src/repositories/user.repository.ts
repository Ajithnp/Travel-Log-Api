import { injectable } from "tsyringe";
import { IUser } from "types/IUser";
import { UserModel } from "../models/user.model";
import { IUserRepository } from "../interfaces/repository_interfaces/IUserRepository";
import { BaseRepository } from "./base.repository";
import { USER_ROLES } from "../shared/constants/roles";
import { IVendor } from "types/IVendor";


@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(UserModel);
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email }).exec();
    }

    // async findUsers(): Promise <IUser [] | null> {
    //     return await UserModel.find({role: USER_ROLES.USER}).exec();
    // };
    
    // async getDocsCount(role?:string): Promise<number> {
    //     return await UserModel.countDocuments({role}).exec();
    // };

    async updateIsVerified(email: string, status: boolean): Promise<IUser | null> {
        return await UserModel.findOneAndUpdate(
            { email },
            { isEmailVerified: status },
            { new: true }
        ).exec();
    }
    
    async updatePassword(email:string, password:string):Promise<IUser | null> {
        return await UserModel.findOneAndUpdate(
            {email},
            {password},
            {new:true}
        )
    }
 
}