import { Request, Response, NextFunction } from "express";

export interface IAdminVendorController {
    vendorVerificationRequest(req: Request, res:Response, next:NextFunction): Promise<void>;

    updateVendorverification(req: Request, res: Response, next:NextFunction): Promise<void>;

    getVendors(req: Request, res:Response, next: NextFunction):Promise<void>;

    blockOrUnclockVendor(req: Request, res:Response, next:NextFunction): Promise<void>
}