export interface IAdminFinanceService {

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
    