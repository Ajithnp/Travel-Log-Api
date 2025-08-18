import { inject, injectable } from "tsyringe";
import { IAdminUserService } from "../../interfaces/service_interfaces/IAdminUserService";
import { IApiResponse } from "types/common/IApiResponse";
import { IUser } from "../../types/IUser";
import { IUserRepository } from "../../interfaces/repository_interfaces/IUserRepository";
import { AppError } from "../../errors/AppError";
import { ERROR_MESSAGES } from "../../shared/constants/messages";
import { HTTP_STATUS } from "../../shared/constants/http_status_code";
import { ITokenService } from "../../interfaces/service_interfaces/ITokenService";
import { blacklistToken } from "../../shared/utils/token.revocation.helper";
import { USER_ROLES } from "../../shared/constants/roles";
import { PaginatedData } from "../../interfaces/common_interfaces/output_types/pagination";
import { Types } from "mongoose";


@injectable()
export class AdminUserService implements IAdminUserService {

    constructor(
        @inject("IUserRepository")
        private _userRepository : IUserRepository,
        @inject("ITokenService")
        private _tokenService : ITokenService,
    ){}

    async fetchUsers(page: number, limit:number): Promise<PaginatedData<Partial<IUser>>> {

        const skip = (page - 1) * limit;
        const query = {role:USER_ROLES.USER};
        const options = {skip,limit};

        const usersDoc = await this._userRepository.find(query,options);
        const totalUsers = await this._userRepository.getDocsCount(USER_ROLES.USER);

        const userData : Partial<IUser>[] = usersDoc.map(user => ({
            id: (user._id as Types.ObjectId).toString(),
            name: user.name,
            email:user.email,
            isBlocked:user.isBlocked,
            createdAt: user.createdAt,

        }));

        return {
            data: userData, 
            currentPage:page,
            totalPages: Math.ceil(totalUsers / limit),
            totalUsers

        };
    };
//==========================================================================================

    async updateUserAccess(id: string, block: boolean,reason:string,accessToken?: string): Promise<void> {

        const userDoc = await this._userRepository.findById(id);
        if(!userDoc) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
        }

        const userUpdatedDoc = await this._userRepository.update(id,
            {
                isBlocked:block,
                blockedReason: block === true ? reason : ""
            });


        if(!userUpdatedDoc){
            throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,HTTP_STATUS.INTERNAL_SERVER_ERROR);
        };

        if(block && accessToken){
            blacklistToken(accessToken);
        };

    };
};