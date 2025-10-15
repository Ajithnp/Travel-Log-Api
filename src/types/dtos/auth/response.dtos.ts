export interface SignupResponseDTO {
  email: string;
  role: string;
  otpExpiresIn: number;
  serverTime: number;
}

export interface LoginResponseDTO {
  id?: string;
  name: string;
  email: string;
  isEmailverified: boolean;
  role: string;
}

export interface TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailResponseDTO {
  name: string;
  email: string;
  role: string;
}

export interface SendOtpResponseDTO {
  otpExpiresIn: number;
  serverTime: number;
}

export interface GoogleAuthResponseDTO {
  name: string;
  email: string;
  role: string;
}

export interface ForgotPasswordResponseDTO extends SendOtpResponseDTO {
  email: string;
  role: string;
}

export interface AuthResultDTO<T> extends TokenResponseDTO {
  user: T;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  newRefreshToken?: string;
}
