import { Request, Response, NextFunction } from 'express';

export interface IS3Controller {
  generateUploadURL(req: Request, res: Response, next: NextFunction): Promise<void>;

  generateDownloadURL(req: Request, res: Response, next: NextFunction): Promise<void>;
}
