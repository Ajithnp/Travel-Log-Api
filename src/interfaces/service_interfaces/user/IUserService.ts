import {
  UserProfileResponseDTO,
  IUpdateEmailResponseDTO
} from "../../../types/dtos/user/response.dtos";
import {
  UpdateEmailRequestDTO,
  VerifyEmailRequestDTO,
  ResetPasswordRequestDTO,
  UpdateProfileRequestDTO,
} from "../../../types/dtos/user/request.dtos";
export interface IUserService {

  profile(userId: string): Promise<UserProfileResponseDTO>;

  updateProfile(payload:UpdateProfileRequestDTO): Promise<void>

  updateEmailRequest(payload: UpdateEmailRequestDTO): Promise<IUpdateEmailResponseDTO>;

  updateEmail(payload: VerifyEmailRequestDTO): Promise<void>

  resetPassword(payload: ResetPasswordRequestDTO): Promise<void>;
}
