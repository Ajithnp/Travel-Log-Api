import { IUser } from "types/IUser";
import { UserCreateDto } from "dtos/createUser.dtos";
import { IAuthResponse } from "types/IAuthResponseType";
import { IAuthResponseDTO } from "dtos/auth/auth.response.dtos";
import { IRegisterUserDTO } from "dtos/auth/register.user.dtos";
import { ILoginUserDTO } from "dtos/auth/login.user.dtos";

export interface IAuthService {
  
    register(userData: IRegisterUserDTO): Promise<IAuthResponseDTO>;

    login(userData: ILoginUserDTO): Promise<IAuthResponse<IAuthResponseDTO>>;

    emailVerify(email:string, otp:string): Promise<IAuthResponse<IAuthResponseDTO>>;

    forgotPassword(email:string):Promise<Partial<IAuthResponseDTO>>

    updatePassword(email:string,password:string): Promise<void>

    googleAuthentication(token: string, clientId: string): Promise<IAuthResponse<IAuthResponseDTO>>

    refreshAccessToken(refreshToken: string | undefined): Promise<string>;

}