export interface UserProfileResponseDTO {
  id: string;
  name: string;
  phone: string;
  email: string;
  isBlocked: boolean;
  createdAt: string;
}

export interface IUpdateEmailResponseDTO {
  email: string;
  otpExpiresIn: number;
  serverTime: number;
}
