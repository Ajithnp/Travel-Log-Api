import { UserRole } from 'types/entities/user.entity';
export interface IAuthResponseDTO {
  name: string;
  email: string;
  phone?: string;
  googleId?: string;
  profile?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  role: UserRole;
  otpExpiresIn?: number;
  serverTime?: number;
  // cookies?:string | string[] | undefined
}
