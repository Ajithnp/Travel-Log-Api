import { SendOtpResponseDTO } from '../../types/dtos/auth/response.dtos';
import { VerifyOtpRequestDTO } from '../../types/dtos/auth/request.dtos';
export interface IOtpService {
  sendOtp(email: string): Promise<SendOtpResponseDTO>;

  verifyOtp(data: VerifyOtpRequestDTO): Promise<void>;
}
