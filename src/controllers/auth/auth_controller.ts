import { NextFunction, Request, Response } from "express";
import { IAuthController } from "interfaces/controller_interfaces/IAuthController";
import { inject, injectable } from "tsyringe";
import { IAuthService } from "interfaces/service_interfaces/IAuthService";
import { IApiResponse } from "types/common/IApiResponse";
import { IAuthResponse } from "types/IAuthResponseType";
import { clearAuthCookies,setAuthCookies } from "../../shared/utils/cookieHelper";
import { ITokenService } from "interfaces/service_interfaces/ITokenService";
import { registerSchema, loginSchema } from "../../validators/auth.schema";
import { SUCCESS_STATUS, HTTP_STATUS } from "../../shared/constants/http_status_code";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../shared/constants/messages";
import {ILoginUserDTO} from "../../dtos/auth/login.user.dtos";
import { IRegisterUserDTO } from "../../dtos/auth/register.user.dtos";
import { AppError } from "../../errors/AppError";
import { IAuthResponseDTO } from "../../dtos/auth/auth.response.dtos";
import { JWT_TOKEN } from "../../shared/constants/jwt.token";
import { IOtpService } from "interfaces/service_interfaces/IOtpService";

@injectable()
export class AuthController implements IAuthController {
    constructor(
        @inject('IAuthService')
        private _authService: IAuthService,
        @inject('ITokenService')
        private _tokenService: ITokenService,
        @inject('IOtpService')
        private _otpService: IOtpService,
    ){}


    async login(req: Request, res: Response,next:NextFunction): Promise<void> {

        const parsed = loginSchema.safeParse(req.body);
        if(!parsed.success){
            throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.BAD_REQUEST)
        }
        const credentials : ILoginUserDTO = parsed.data;
        
      try {
          const { user, accessToken, refreshToken } = await this._authService.login(credentials);
        //  const role = user.role
        setAuthCookies(res,
             JWT_TOKEN.ACCESS_TOKEN, accessToken,
              10 * 60 * 1000);
        setAuthCookies(res,
             JWT_TOKEN.REFRESH_TOKEN, refreshToken,
              7 * 24 * 60 * 60 * 1000);

            //   const cookies = res.getHeader("Set-Cookie") as string | string[] | undefined;

        const successResponse: IApiResponse<Partial<IAuthResponseDTO>> = {
            success: SUCCESS_STATUS.SUCCESS,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                role:user.role,
                
            },
        };
        res.status(HTTP_STATUS.OK).json(successResponse);
        
      } catch (error) {
        next(error)
      }
    }

//===================================================================================    

    async register(req: Request, res: Response ,next: NextFunction): Promise<void> {
        const parsed = registerSchema.safeParse(req.body);
      
        if(!parsed.success) {
            throw new AppError(ERROR_MESSAGES.VALIDATION_ERROR,HTTP_STATUS.BAD_REQUEST);
        }
        const crendentials: IRegisterUserDTO = parsed.data;

        try {
        const  user  = await this._authService.register(crendentials);

        const successResponse: IApiResponse<Partial<IAuthResponseDTO>> = {
            success: SUCCESS_STATUS.SUCCESS,
            message:SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
            data: {
                name:user.name,
                email:user.email,
                role:user.role,
                isEmailVerified:user.isEmailVerified
            },
            
        };
     res.status(HTTP_STATUS.CREATED).json(successResponse)
            
        } catch (error) {
            next(error);
        };
    };
//===============================================================================   

    async verifyEmail (req:Request,res:Response, next:NextFunction):Promise<void> {

        const {email, otp} = req.body;
        if(!email || !otp){
            throw new AppError(ERROR_MESSAGES.EMAIL_OR_OTP_ARE_MISSING, HTTP_STATUS.BAD_REQUEST);
        };

        try {
           const {user, accessToken, refreshToken} = await this._authService.emailVerify(email,otp);

           setAuthCookies(res,
            JWT_TOKEN.ACCESS_TOKEN, accessToken,
             10 * 60 * 1000
           )

           setAuthCookies(res,
            JWT_TOKEN.REFRESH_TOKEN, refreshToken,
            7 * 24 * 60 * 60 * 1000
           )

           const successResponse : IApiResponse<Partial<IAuthResponseDTO>> = {
              success: SUCCESS_STATUS.SUCCESS,
              message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
              data:{
                name: user.name,
                email: user.email,
                role: user.role
              }

           };

           res.status(HTTP_STATUS.OK).json(successResponse);
            
        } catch (error) {
            next(error)
        };
    };
//==========================================================================================    

    async resendOtp (req:Request, res:Response, next:NextFunction):Promise<void> {

        const { email } = req.body;
        if(!email){
            throw new AppError(ERROR_MESSAGES.EMAIL_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
        };

        try {
            await this._otpService.sendOtp(email);

            const successResponse : IApiResponse = {
                success: SUCCESS_STATUS.SUCCESS,
                message: SUCCESS_MESSAGES.RESEND_OTP_SUCCESS
            };

            res.status(HTTP_STATUS.OK).json(successResponse);
             
        } catch (error) {
            next(error)
        };
    };

//===============================================================================================

    async googleAuthCallback(req: Request, res: Response, next:NextFunction): Promise<void> {
        const { token, clientId } = req.body;
        if(!token || !clientId){
            throw new AppError(ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED,HTTP_STATUS.BAD_REQUEST)
        }
        
        try {
            
        const {user, accessToken, refreshToken } = await this._authService.googleAuthentication(token, clientId);

        // setting cookies
        setAuthCookies(
            res, 
            JWT_TOKEN.ACCESS_TOKEN, accessToken,
             10* 60* 1000);

         setAuthCookies(res,
            JWT_TOKEN.REFRESH_TOKEN, refreshToken,
            7* 24* 60* 100
         );    

         const successResponse : IApiResponse<Partial<IAuthResponseDTO>> = {
            success:SUCCESS_STATUS.SUCCESS,
            message:SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
            data: {
                name:user.name,
                email:user.email,
                role:user.role
            }
         }

         res.status(HTTP_STATUS.CREATED).json(successResponse);

        } catch (error) {
            next(error)
        };
    };

//=====================================================================================
    async forgotPasswordRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { email } = req.body 
        
        if(!email){
            throw new AppError(ERROR_MESSAGES.EMAIL_NOT_PROVIDED,HTTP_STATUS.BAD_REQUEST);
        }
        try {
        const user = await this._authService.forgotPassword(email)

         const successResponse : IApiResponse<Partial<IAuthResponseDTO>> = {
            success:SUCCESS_STATUS.SUCCESS,
            message:SUCCESS_MESSAGES.EMAIL_VERIFIED,
            data: {
                email:user.email,
            }
         };
         
         res.status(HTTP_STATUS.OK).json(successResponse)
            
        } catch (error) {
            next(error)
        };
    }

//========================================================================================

    async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {

        const { otp, email } = req.body;
        if(!otp || !email){
            throw new AppError(ERROR_MESSAGES.INVALID_REQUEST,HTTP_STATUS.BAD_REQUEST);
        }
        try {
            await this._otpService.verifyOtp(email,otp);

            const successResponse:IApiResponse = {
                success: SUCCESS_STATUS.SUCCESS,
                message: SUCCESS_MESSAGES.OTP_VERIFIED
            };

            res.status(HTTP_STATUS.OK).json(successResponse);
            
        } catch (error) {
           next(error) 
        };
    };

//========================================================================================    

    async changePassword(req: Request, res: Response, next:NextFunction): Promise <void> {
       
        const {email, password} = req.body;
        if(!password || ! email){
            throw  new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS,HTTP_STATUS.BAD_REQUEST);
        }

        try {
          await this._authService.updatePassword(email,password)

          const successResponse:IApiResponse = {
             success:SUCCESS_STATUS.SUCCESS,
             message:SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY
          }
       
          res.status(HTTP_STATUS.OK).json(successResponse);  
            
        } catch (error) {
            next(error);
        };
    };

//======================================================================================

    async refreshAccessToken(req: Request, res: Response, next:NextFunction): Promise<void> {
        const refreshToken = req.cookies?.[JWT_TOKEN.REFRESH_TOKEN];
          if (!refreshToken) {
             throw new AppError(ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, HTTP_STATUS.UNAUTHORIZED);
           }
 
            try {

            const accessToken = await this._authService.refreshAccessToken(refreshToken);

              clearAuthCookies(res,
                JWT_TOKEN.ACCESS_TOKEN);
               setAuthCookies(res, 
                JWT_TOKEN.ACCESS_TOKEN, accessToken, 
                 5 * 60 * 1000);

               const successResponse: IApiResponse = {
                 success: SUCCESS_STATUS.SUCCESS,
                 message: SUCCESS_MESSAGES.TOKEN_REFRESHED
               };
               
             res.status(HTTP_STATUS.OK).json(successResponse);
                
            } catch (error) {
                next(error)
            };
    };  
//=====================================================================================
    async logout(req: Request, res: Response) {

        clearAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN);
        clearAuthCookies(res, JWT_TOKEN.REFRESH_TOKEN);

        //   const cookies = res.getHeader("Set-Cookie") as string | string[] | undefined;

        const successResponse : IApiResponse<Partial<IAuthResponseDTO>> = {
            success:SUCCESS_STATUS.SUCCESS,
            message:SUCCESS_MESSAGES.LOGOUT_SUCCESS,
            
        };

        res.status(HTTP_STATUS.OK).json(successResponse);
    };
};