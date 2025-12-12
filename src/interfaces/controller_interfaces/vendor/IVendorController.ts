import { Request, Response, NextFunction } from 'express';

export interface IVendorController {
  profile(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateProfileLogo(req: Request, res: Response, next: NextFunction): Promise<void>;
  vendorVerificationSubmit(req: Request, res: Response, next: NextFunction): Promise<void>;
}
