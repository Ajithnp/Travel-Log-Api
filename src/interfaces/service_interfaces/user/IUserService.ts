import {
  UserProfileResponseDTO,
  IUpdateEmailResponseDTO,
} from '../../../types/dtos/user/response.dtos';
import {
  UpdateEmailRequestDTO,
  VerifyEmailRequestDTO,
  ResetPasswordRequestDTO,
  UpdateProfileRequestDTO,
} from '../../../types/dtos/user/request.dtos';
export interface IUserService {
  profile(userId: string): Promise<UserProfileResponseDTO>;

  updateProfile(payload: UpdateProfileRequestDTO): Promise<void>;

  updateEmailRequest(payload: UpdateEmailRequestDTO): Promise<IUpdateEmailResponseDTO>;

  updateEmail(payload: VerifyEmailRequestDTO): Promise<void>;

  resetPassword(payload: ResetPasswordRequestDTO): Promise<void>;

  dashboard(userId: string): Promise<UserDashboardResponseDTO>;
}

export interface UserDashboardResponseDTO {
  reviewsCount: number;
  walletBalance: number;
  upcomingTrips: number;
  pastTrips: number;
}
