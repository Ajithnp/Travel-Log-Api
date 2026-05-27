import { PackageStatus } from "types/type";
import { PaginatedData } from "../../../types/common/IPaginationResponse";
import { DifficultyLevel } from "../../../types/entities/base-package.entity";
import { AdminPackageDetailsResult } from "../../../interfaces/repository_interfaces/IBasePackageRepository";


export interface IAdminVendorPackageOversightService {
    getPackages(page:number, limit:number, search?:string):Promise<PackagesOversightResponseDTO>;
    getPackageDetails(packageId:string):Promise<AdminPackageDetailsResponseDTO>;
    getPackageSchedules(packageId:string, page:number, limit:number):Promise<PaginatedData<PackageScheduleResponseDTO>>;
}

export type AdminPackageDetailsResponseDTO = AdminPackageDetailsResult;

export interface PackageScheduleResponseDTO {
    _id:string;
    startDate:Date;
    endDate:Date;
    totalSeats:number;
    totalRevanue:number;
    bookingsCount:number;
    soldSeats:number;
    status:string;
};

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