import { injectable } from "tsyringe";
import { IUser } from "types/IUser";
import { UserModel } from "../models/user.model";
import { IUserRepository } from "../interfaces/repository_interfaces/IUserRepository";
import { BaseRepository } from "./base.repository";

@injectable()
export class UserRepository extends BaseRepository<IUser> implements IUserRepository {

    constructor() {
        super(UserModel);
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
        return await UserModel.findOne({ email }).exec();
    }

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