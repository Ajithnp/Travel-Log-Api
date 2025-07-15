import { IUser } from "./IUser";
import { IAuthResponseDTO } from "dtos/auth/auth.response.dtos";

export interface IAuthResponse <T>{
    user: T;
    accessToken: string;
    refreshToken: string;
}