import { PaginatedData } from "../../../interfaces/common_interfaces/output_types/pagination";
import { IVendor } from "../../../types/IVendor";
import { IVendorInfoResponseDTO } from "../../../dtos/vendor/vendor.info.response.dtos";
import { VendorVerificationUpdateDTO } from "../../../dtos/admin/vendor.verification.update.dtos";
import { IUser } from "types/IUser";


export interface IAdminVendorService {
    vendorVerificationRequestService(page: number, limit: number):Promise<PaginatedData<Partial<IVendorInfoResponseDTO>>>;

    updateVendorVerificationService(vendorId: string, paload: VendorVerificationUpdateDTO):Promise<void>;

    fetchVendorService(page: number, limit: number):Promise<PaginatedData <Partial<IUser>>>;

    updateVendorAccessService(id:string, block:boolean,reason?:string,token?:string): Promise<void>;
}