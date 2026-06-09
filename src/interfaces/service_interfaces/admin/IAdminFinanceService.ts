export interface IAdminFinanceService {

     getCommissionOverview(): Promise<CommissionOverview>;
     getCommissionsByVendors(page:number,limit:number,search?:string):Promise<PaginatedCommissionOverviewByVendors>;
     getCommissionsByVendorsPackages(page:number,limit:number,sortBy:string,search?:string):Promise<PaginatedCommissionOverviewByPackages>

}

export interface CommissionOverview{
    totalGrossAmount: number;
    totalPlatformCommission: number;
    totalVendorEarnings: number;
};


export interface CommissionOverviewByVendors{
    vendorName:string;
    totalPackages:number;
    totalCompletedSchedules:number;
    totalBookings:number;
    totalGrossAmount:number;
    totalPlatformCommission:number;
    totalVendorEarnings:number;
};

export interface PaginatedCommissionOverviewByVendors{
    data:CommissionOverviewByVendors[];
    page:number;
    limit:number;
    totalPages:number;
    totalDocs:number;
    totalBookings:number;
    totalScedules:number;
};

export interface CommissionOverviewByPackages{
    vendorName:string;
    packageName:string;
    totalScedule:number;
    totalBookings:number;
    totalGrossAmount:number;
    totalPlatformCommission:number;
    totalVendorEarnings:number;
};

export interface PaginatedCommissionOverviewByPackages{
    data:CommissionOverviewByPackages[];
    page:number;
    limit:number;
    totalPages:number;
    totalDocs:number;
    totalBookings:number;
    totalScedules:number;
    totalPackages:number;
    totalVendorEarnings:number;
    totalPlatformCommission:number;
    totalGrossAmount:number;
};

    