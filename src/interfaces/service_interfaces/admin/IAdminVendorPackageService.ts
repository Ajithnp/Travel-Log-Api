import { PaginatedData } from "../../../types/common/IPaginationResponse";
import { DifficultyLevel } from "../../../types/entities/base-package.entity";


export interface IAdminVendorPackageOversightService {
    getPackages(page:number, limit:number, search?:string):Promise<PackagesOversightResponseDTO>;
}



export interface PackagesOversightResponseDTO extends PaginatedData<VendorsPackagesResponseDTO> {
    totalPublished: number;
}

export interface VendorsPackagesResponseDTO{
    _id:string;
    packageName:string;
    location:string;
    state:string;
    totalDays:number;
    difficultylevel:DifficultyLevel;
    vendorName:string;
    categoryName:string;
    scheduleCount:number
}