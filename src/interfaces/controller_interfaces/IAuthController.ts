
// import { NextFunction, Request, Response } from 'express';

// export interface IAuthController {
//   registerUser(req: Request, res: Response, next: NextFunction): Promise<void>;

//   loginUser(req: Request, res: Response, next: NextFunction): Promise<void>;

//   verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;

//   resendOtp(req: Request, res: Response, next: NextFunction): Promise<void>;

//   verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void>;

//   googleAuthCallback(req: Request, res: Response, next: NextFunction): Promise<void>;

//   forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;

//   changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;

//   refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void>;

//   logout(req: Request, res: Response, next: NextFunction): Promise<void>;
// }
import { RequestHandler } from "express";

export interface IAuthController {
  registerUser: RequestHandler;
  loginUser: RequestHandler;
  verifyEmail: RequestHandler;
  resendOtp: RequestHandler;
  verifyOtp: RequestHandler;
  googleAuthCallback: RequestHandler;
  forgotPassword: RequestHandler;
  changePassword: RequestHandler;
  refreshAccessToken: RequestHandler;
  logout: RequestHandler;
}

