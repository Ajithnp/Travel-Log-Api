import { Request, Response, NextFunction } from 'express';

export interface IUserProfileController {
  profile(req: Request, res: Response, next: NextFunction): Promise<void>;

  updateProfile(req: Request, res: Response, next: NextFunction): Promise<void>;

  resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;

  updateEmailRequest(req: Request, res: Response, next: NextFunction): Promise<void>;

  updateEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
}
