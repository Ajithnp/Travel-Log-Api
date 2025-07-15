import { NextFunction, Request, Response } from "express";

export interface IAuthController {

    register(req: Request, res: Response, next:NextFunction): Promise<void>;

    login(req: Request, res: Response, next:NextFunction): Promise<void>;

    verifyEmail(req:Request, res:Response, next:NextFunction): Promise<void>;

    resendOtp(req:Request, res:Response, next:NextFunction): Promise<void>;

    verifyOtp(req:Request, res:Response,next:NextFunction):Promise<void>;

    googleAuthCallback(req: Request, res: Response, next:NextFunction): Promise<void>;

    forgotPasswordRequest(req: Request, res: Response, next:NextFunction): Promise<void>

    changePassword(req: Request, res: Response, next:NextFunction): Promise<void>

    refreshAccessToken(req: Request, res: Response,next:NextFunction): Promise<void>;
    
    logout(req: Request, res: Response,next:NextFunction): Promise<void>;
};