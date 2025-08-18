import { Request, Response, NextFunction } from "express"

export interface IVendorController {
    vendorVerificationSubmit(req: Request, res: Response, next: NextFunction): Promise<void>;
}