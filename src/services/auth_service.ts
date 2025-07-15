import { inject, injectable } from "tsyringe";
import { IUserRepository } from "../interfaces/repository_interfaces/IUserRepository";
import { IBcryptUtils } from "types/common/IBcryptUtils";
import { UserCreateDto } from "../dtos/createUser.dtos";
import { IAuthService } from "../interfaces/service_interfaces/IAuthService";
import { IAuthResponse } from "types/IAuthResponseType";   
import { ITokenService } from "interfaces/service_interfaces/ITokenService";
import { IGoogleService } from "interfaces/service_interfaces/IGoogleService";
import logger from "../shared/utils/logger";
import { IRegisterUserDTO } from "dtos/auth/register.user.dtos";
import { IAuthResponseDTO } from "dtos/auth/auth.response.dtos";
import { IRefreshToekenPayload } from "../types/IRefreshTokenPayload";
import { ILoginUserDTO } from "dtos/auth/login.user.dtos";
import { AppError } from "../errors/AppError";
import { ERROR_MESSAGES } from "../shared/constants/messages";
import { HTTP_STATUS } from "../shared/constants/http_status_code";
import { IOtpService } from "interfaces/service_interfaces/IOtpService";


@injectable()
export class AuthService implements IAuthService {
    constructor(
        @inject("IUserRepository")
        private _userRepository: IUserRepository,
        @inject("IBcryptUtils")
        private _passwordBcrypt: IBcryptUtils,
        @inject("ITokenService")
        private _tokenService: ITokenService,
        @inject("IGoogleService")
        private _googleService: IGoogleService,
        @inject("IOtpService")
        private _otpService: IOtpService

    ) {}


    async login(credentials: ILoginUserDTO): Promise<IAuthResponse<IAuthResponseDTO>> {
     
        const  { email, password } = credentials;
        const user = await this._userRepository.findUserByEmail(email);

        if(!user) {
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS.BAD_REQUEST);
        };

        if(!user.isActive){
            throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED,HTTP_STATUS.FORBIDDEN);
        }

        const isPasswordMatch = await this._passwordBcrypt.comparePassword(password, user.password);
        if(!isPasswordMatch){
            throw new AppError(ERROR_MESSAGES.PASSWORD_DO_NOT_MATCH,HTTP_STATUS.BAD_REQUEST);
        };

        if(!user.isEmailVerified){
           throw new AppError(ERROR_MESSAGES.VERIFY_YOUR_EMAIL,HTTP_STATUS.BAD_REQUEST);
        };

        //Genarate Tokens
        const accessToken = this._tokenService.generateAccessToken({
             id: user._id,
             email: user.email,
             role: user.role
            })

        const refreshToken = this._tokenService.generateRefreshToken({
            id: user._id,
            email: user.email,
            role: user.role
        })  

        const userData : IAuthResponseDTO = {
            name: user.name,
            email: user.email,
            role: user.role,
        };

        return {user:userData, accessToken, refreshToken};
    }

    //=============================================================================

    async register(credentials: IRegisterUserDTO): Promise<IAuthResponseDTO> {
        const { name, email, phone, password} = credentials;

        const isUserExisting = await this._userRepository.findUserByEmail(email);
        if (isUserExisting) {
            throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
        }
       
        const hashedPassword = await this._passwordBcrypt.hashPassword(password);
        
       const newUser  = await this._userRepository.create({
        name,
        email,
        phone,
        password: hashedPassword,
       })

       logger.info('user saved success')
       
       // controll move to verification module!
        await this._otpService.sendOtp(email);
       

       const user:IAuthResponseDTO = {
           name:newUser.name,
           email:newUser.email,
           role:newUser.role
       }

        return user;
    }

//===================================================================================    
    async emailVerify(email: string, otp:string):Promise<IAuthResponse<IAuthResponseDTO>> {

        const userDoc = await this._userRepository.findUserByEmail(email);
        if(!userDoc){
            throw new AppError(ERROR_MESSAGES.OTP_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
        }
        if(userDoc.isEmailVerified){
            throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED,HTTP_STATUS.CONFLICT);
        }

         await this._otpService.verifyOtp(email,otp);

         const newUserDoc = await this._userRepository.updateIsVerified(
            email,
            true
         )

         if(!newUserDoc){
            throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,HTTP_STATUS.INTERNAL_SERVER_ERROR);
         }

         // generate Tokens
         const accessToken = this._tokenService.generateAccessToken({
            email:email,
            role:userDoc.role
         });

         const refreshToken = this._tokenService.generateRefreshToken({
            email:email,
            role:userDoc.role
         });

         const newUser :IAuthResponseDTO = {
            name:userDoc.name,
            email: userDoc.email,
            role: userDoc.role
         }

         return {user: newUser, accessToken, refreshToken}

    }
//===================================================================================    
    async googleAuthentication(token: string, clientId: string): Promise<IAuthResponse<IAuthResponseDTO>> {

        const payload = await this._googleService.getUserInfoFromAccessToken(token,clientId)

        // Check if the user already exists in the database
        let user = await this._userRepository.findUserByEmail(payload.email);
        if(!user){
            user = await this._userRepository.create({
                name: payload.name,
                email: payload.email,
                googleId: payload.googleId,
                isEmailVerified: true,
        });

        };

        if(!user.isActive){
            throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED,HTTP_STATUS.FORBIDDEN);
        };

        // token generation
          const accessToken = this._tokenService.generateAccessToken({
            email: user.email,
             role: user.role
            });

           const refreshToken = this._tokenService.generateRefreshToken({
            email: user.email,
            role: user.role
           });

           const googleUser :IAuthResponseDTO = {
             name: user.name,
             email: user.email,
             role: user.role
           };
        
        return { user:googleUser, accessToken, refreshToken}
    };
//===================================================================================    
    async forgotPassword(email: string): Promise<Partial<IAuthResponseDTO>> {

        const isUserEmailExist = await this._userRepository.findUserByEmail(email);
        if(!isUserEmailExist){
            throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
        };
        if(!isUserEmailExist.isEmailVerified){
            throw new AppError(ERROR_MESSAGES.UNVALIDATED_EMAIL,HTTP_STATUS.FORBIDDEN);
        };
        if(!isUserEmailExist.isActive){
            throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED,HTTP_STATUS.FORBIDDEN);
        };

        await this._otpService.sendOtp(email);

        const user : Partial<IAuthResponseDTO> = {
            email: isUserEmailExist.email
        };

        return user;
        
    };

//=======================================================================================
   async updatePassword(email: string, password: string): Promise<void> {
       const userDoc = await this._userRepository.findUserByEmail(email);
       if(!userDoc){
          throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND,HTTP_STATUS.NOT_FOUND);
       }

       if(!userDoc.isEmailVerified){
         throw new AppError(ERROR_MESSAGES.UNVALIDATED_EMAIL,HTTP_STATUS.BAD_REQUEST);
       }

       if(!userDoc.isActive){
         throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED,HTTP_STATUS.CONFLICT);
       }

       const newHashedPassword = await this._passwordBcrypt.hashPassword(password);

       const userDocUpdated = await this._userRepository.updatePassword(email, newHashedPassword);

       if(!userDocUpdated){
        throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR,HTTP_STATUS.INTERNAL_SERVER_ERROR);
       }
   }    

//=======================================================================================    
    async refreshAccessToken(refreshToken: string): Promise<string> {
       
        const decoded = this._tokenService.verifyRefreshToken(refreshToken);
        if(!decoded){
            throw new AppError(ERROR_MESSAGES.AUTH_INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
        }

        const accessToken = this._tokenService.generateAccessToken({
            id: decoded.id,
            email:decoded.email,
            role: decoded.role
        })

        return accessToken;
    }

}
//=================================================================================
