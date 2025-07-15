import { UserRole } from "types/IUser";
export interface IAuthResponseDTO {
    name: string;
    email: string;
    phone?: string;
    googleId?: string;
    profile?: string;
    isEmailVerified?: boolean;
    isActive?: boolean;
    role: UserRole;
    cookies?:string | string[] | undefined
}