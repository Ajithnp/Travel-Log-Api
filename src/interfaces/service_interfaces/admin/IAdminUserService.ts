import { IApiResponse } from "../../../types/common/IApiResponse";
import { IUser } from "../../../types/IUser";
import { PaginatedData } from "../../../interfaces/common_interfaces/output_types/pagination";


export interface IAdminUserService {

    // fetchUsers():Promise<IUser []>
    fetchUsers(page: number, limit:number):Promise<PaginatedData <Partial<IUser>>>;
    
    updateUserAccess(id:string, block:boolean,reson:string,token?:string): Promise<void>;
};