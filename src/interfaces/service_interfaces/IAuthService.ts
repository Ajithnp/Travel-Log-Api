import {
  LoginRequestDTO,
  SignupRequestDTO,
  VerifyEmailRequestDTO,
  GoogleAuthRequestDTO,
  ForgotPasswordRequestDTO,
  ChangePasswordRequestDTO,
  RefreshTokenRequestDTO,
} from 'types/dtos/auth/request.dtos';
import {
  AuthResultDTO,
  LoginResponseDTO,
  SignupResponseDTO,
  VerifyEmailResponseDTO,
  GoogleAuthResponseDTO,
  ForgotPasswordResponseDTO,
  RefreshTokenResponseDTO,
} from 'types/dtos/auth/response.dtos';

export interface IAuthService {
  registerUser(payload: SignupRequestDTO): Promise<SignupResponseDTO>;

  loginUser(payload: LoginRequestDTO): Promise<AuthResultDTO<LoginResponseDTO>>;

  emailVerify(payload: VerifyEmailRequestDTO): Promise<AuthResultDTO<VerifyEmailResponseDTO>>;

  forgotPassword(payload: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO>;

  changePassword(payload: ChangePasswordRequestDTO): Promise<void>;

  googleAuthentication(
    payload: GoogleAuthRequestDTO,
  ): Promise<AuthResultDTO<GoogleAuthResponseDTO>>;

  refreshAccessToken(payload: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO>;
}
