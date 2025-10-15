import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../interfaces/repository_interfaces/IUserRepository';
import { IBcryptUtils } from 'interfaces/common_interfaces/IBcryptUtils';
import { IAuthService } from '../interfaces/service_interfaces/IAuthService';
import { ITokenService } from 'interfaces/service_interfaces/ITokenService';
import { IGoogleService } from 'interfaces/service_interfaces/IGoogleService';
import logger from '../config/logger';
import { AppError } from '../errors/AppError';
import { ERROR_MESSAGES } from '../shared/constants/messages';
import { HTTP_STATUS } from '../shared/constants/http_status_code';
import { IOtpService } from 'interfaces/service_interfaces/IOtpService';
import {
  LoginRequestDTO,
  SignupRequestDTO,
  VerifyEmailRequestDTO,
  GoogleAuthRequestDTO,
  ForgotPasswordRequestDTO,
  ChangePasswordRequestDTO,
  RefreshTokenRequestDTO,
} from '../types/dtos/auth/request.dtos';
import {
  LoginResponseDTO,
  AuthResultDTO,
  SignupResponseDTO,
  VerifyEmailResponseDTO,
  GoogleAuthResponseDTO,
  ForgotPasswordResponseDTO,
  RefreshTokenResponseDTO,
} from '../types/dtos/auth/response.dtos';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject('IUserRepository')
    private _userRepository: IUserRepository,
    @inject('IBcryptUtils')
    private _passwordBcrypt: IBcryptUtils,
    @inject('ITokenService')
    private _tokenService: ITokenService,
    @inject('IGoogleService')
    private _googleService: IGoogleService,
    @inject('IOtpService')
    private _otpService: IOtpService,
  ) {}

  async loginUser(payload: LoginRequestDTO): Promise<AuthResultDTO<LoginResponseDTO>> {
    const { email, password } = payload;
    const user = await this._userRepository.findOne({ email });

    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.BAD_REQUEST);
    }

    if (user.isBlocked) {
      throw new AppError(
        `${ERROR_MESSAGES.ACCOUNT_BLOCKED} 
           Reason: ${user.blockedReason}`,
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const isPasswordMatch = await this._passwordBcrypt.comparePassword(password, user.password);
    if (!isPasswordMatch) {
      throw new AppError(ERROR_MESSAGES.PASSWORD_DO_NOT_MATCH, HTTP_STATUS.BAD_REQUEST);
    }

    if (!user.isEmailVerified) {
      throw new AppError(ERROR_MESSAGES.VERIFY_YOUR_EMAIL, HTTP_STATUS.BAD_REQUEST, "EMAIL_NOT_VERIFIED");
    }

    //Genarate Tokens
    const accessToken = this._tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailverified: user.isEmailVerified,
      },
    };

    return response;
  }

  //=============================================================================

  async registerUser(payload: SignupRequestDTO): Promise<SignupResponseDTO> {
    const { name, email, phone, password, role } = payload;

    const isUserExisting = await this._userRepository.findOne({ email });
    if (isUserExisting) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HTTP_STATUS.BAD_REQUEST);
    }

    const hashedPassword = await this._passwordBcrypt.hashPassword(password);

    const newUser = await this._userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    const { otpExpiresIn, serverTime } = await this._otpService.sendOtp(email);

    const response = {
      email: newUser.email,
      role: newUser.role,
      otpExpiresIn,
      serverTime,
    };
    return response;
  }

  //===================================================================================
  async emailVerify(
    payload: VerifyEmailRequestDTO,
  ): Promise<AuthResultDTO<VerifyEmailResponseDTO>> {
    const { email } = payload;

    const userDoc = await this._userRepository.findOne({ email });
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.OTP_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    if (userDoc.isEmailVerified) {
      throw new AppError(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED, HTTP_STATUS.CONFLICT);
    }

    await this._otpService.verifyOtp(payload);

    const newUserDoc = await this._userRepository.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
    );

    if (!newUserDoc) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    // generate Tokens
    const accessToken = this._tokenService.generateAccessToken({
      id: userDoc._id.toString(),
      email: email,
      role: userDoc.role,
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      id: userDoc._id.toString(),
      email: email,
      role: userDoc.role,
    });

    const response = {
      accessToken,
      refreshToken,
      user: {
        name: userDoc.name,
        email: userDoc.email,
        role: userDoc.role,
      },
    };

    return response;
  }
  //===================================================================================
  async googleAuthentication(
    payload: GoogleAuthRequestDTO,
  ): Promise<AuthResultDTO<GoogleAuthResponseDTO>> {
    const { token, clientId } = payload;
    const userData = await this._googleService.getUserInfoFromAccessToken(token, clientId);

    // Check if the user already exists in the database
    let user = await this._userRepository.findOne({ email:userData.email });
    if (!user) {
      user = await this._userRepository.create({
        name: userData.name,
        email: userData.email,
        googleId: userData.googleId,
        isEmailVerified: true,
      });
    }

    if (user.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN);
    }

    // token generation
    const accessToken = this._tokenService.generateAccessToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = this._tokenService.generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = {
      accessToken,
      refreshToken,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };

    return response;
  }
  //===================================================================================
  async forgotPassword(payload: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO> {
    const { email } = payload;

    const isUserEmailExist = await this._userRepository.findOne({ email });
    if (!isUserEmailExist) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!isUserEmailExist.isEmailVerified) {
      throw new AppError(ERROR_MESSAGES.UNVALIDATED_EMAIL, HTTP_STATUS.FORBIDDEN);
    }

    if (isUserEmailExist.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.FORBIDDEN);
    }

    const { otpExpiresIn, serverTime } = await this._otpService.sendOtp(email);

    const response = {
      email: isUserEmailExist.email,
      role: isUserEmailExist.role,
      otpExpiresIn,
      serverTime,
    };

    return response;
  }

  //=======================================================================================
  async changePassword(payload: ChangePasswordRequestDTO): Promise<void> {
    const { email, password } = payload;

    const userDoc = await this._userRepository.findOne({ email });
    if (!userDoc) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    if (!userDoc.isEmailVerified) {
      throw new AppError(ERROR_MESSAGES.UNVALIDATED_EMAIL, HTTP_STATUS.BAD_REQUEST);
    }

    if (userDoc.isBlocked) {
      throw new AppError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HTTP_STATUS.CONFLICT);
    }

    const newHashedPassword = await this._passwordBcrypt.hashPassword(password);

    const userDocUpdated = await this._userRepository.findOneAndUpdate(
      { email },
      { password: newHashedPassword }
    );

    if (!userDocUpdated) {
      throw new AppError(ERROR_MESSAGES.UNEXPECTED_SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  //=======================================================================================
  async refreshAccessToken(payload: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    const { refreshToken } = payload;
   
    
    const decoded = this._tokenService.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError(ERROR_MESSAGES.AUTH_INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
    }
   
    

    const accessToken = this._tokenService.generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });

    

    const response = {
      accessToken,
    };

    return response;
  }
}
//=================================================================================
