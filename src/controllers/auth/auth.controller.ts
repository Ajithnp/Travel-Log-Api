import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { IAuthController } from 'interfaces/controller_interfaces/IAuthController';
import { inject, injectable } from 'tsyringe';
import { IAuthService } from 'interfaces/service_interfaces/IAuthService';
import { IApiResponse } from 'types/common/IApiResponse';
import { clearAuthCookies, setAuthCookies } from '../../shared/utils/cookie.helper';
import { SUCCESS_STATUS, HTTP_STATUS } from '../../shared/constants/http_status_code';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../../shared/constants/messages';
import { AppError } from '../../errors/AppError';
import { IAuthResponseDTO } from '../../types/dtos/auth/auth.response.dtos';
import { JWT_TOKEN } from '../../shared/constants/jwt.token';
import { IOtpService } from 'interfaces/service_interfaces/IOtpService';
import {
  LoginResponseDTO,
  SignupResponseDTO,
  VerifyEmailResponseDTO,
  SendOtpResponseDTO,
  GoogleAuthResponseDTO,
  ForgotPasswordResponseDTO,
} from '../../types/dtos/auth/response.dtos';

@injectable()
export class AuthController implements IAuthController {
  constructor(
    @inject('IAuthService')
    private _authService: IAuthService,
    @inject('IOtpService')
    private _otpService: IOtpService,
  ) {}

  loginUser = asyncHandler(async (req, res) => {
    const loginPayload = req.body;

    const { user, accessToken, refreshToken } = await this._authService.loginUser(loginPayload);

    setAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN, accessToken, JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);

    setAuthCookies(
      res,
      JWT_TOKEN.REFRESH_TOKEN,
      refreshToken,
      JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY,
    );

    const successResponse: IApiResponse<LoginResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      data: user,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //===================================================================================

  registerUser = asyncHandler(async (req, res) => {
    const registerPayload = req.body;

    const user = await this._authService.registerUser(registerPayload);

    const successResponse: IApiResponse<SignupResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESSFUL,
      data: user,
    };

    res.status(HTTP_STATUS.CREATED).json(successResponse);
  });

  //===============================================================================

  verifyEmail = asyncHandler(async (req, res) => {
    const verificationPayload = req.body;
    console.log("input", verificationPayload)

    const { user, accessToken, refreshToken } =
      await this._authService.emailVerify(verificationPayload);

    setAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN, accessToken, JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);

    setAuthCookies(
      res,
      JWT_TOKEN.REFRESH_TOKEN,
      refreshToken,
      JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY,
    );

    const successResponse: IApiResponse<VerifyEmailResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
      data: user,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
  //==========================================================================================

  resendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const otpData = await this._otpService.sendOtp(email);

    const successResponse: IApiResponse<SendOtpResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.RESEND_OTP_SUCCESS,
      data: otpData,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //===============================================================================================

  googleAuthCallback = asyncHandler(async (req, res) => {
    const googleAuthPayload = req.body;

    const { user, accessToken, refreshToken, isNewUser } =
      await this._authService.googleAuthentication(googleAuthPayload);

    // setting cookies
    setAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN, accessToken, JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);

    setAuthCookies(
      res,
      JWT_TOKEN.REFRESH_TOKEN,
      refreshToken,
      JWT_TOKEN.REFRESH_TOKEN_COOKIE_EXPIRY,
    );

    const successResponse: IApiResponse<GoogleAuthResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESSFUL,
      data: user,
    };

    res.status(isNewUser ? HTTP_STATUS.CREATED : HTTP_STATUS.OK).json(successResponse);
  });

  //=====================================================================================
  forgotPassword = asyncHandler(async (req, res) => {
    const forgotPasswordPayload = req.body;

    const user = await this._authService.forgotPassword(forgotPasswordPayload);

    const successResponse: IApiResponse<ForgotPasswordResponseDTO> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OTP_SEND,
      data: user,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //========================================================================================

  verifyOtp = asyncHandler(async (req, res) => {
    const verifyOtpPayload = req.body;

    await this._otpService.verifyOtp(verifyOtpPayload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.OTP_VERIFIED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //========================================================================================

  changePassword = asyncHandler(async (req, res) => {
    const passwordChangePayload = req.body;

    await this._authService.changePassword(passwordChangePayload);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });

  //======================================================================================

  refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[JWT_TOKEN.REFRESH_TOKEN];

    if (!refreshToken) {
      throw new AppError(ERROR_MESSAGES.AUTH_NO_TOKEN_PROVIDED, HTTP_STATUS.UNAUTHORIZED);
    }

    const { accessToken } = await this._authService.refreshAccessToken({ refreshToken });

    // Replace old access token cookie
    clearAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN);
    setAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN, accessToken, JWT_TOKEN.ACCESS_TOKEN_COOKIE_EXPIRY);

    const successResponse: IApiResponse = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
  //=====================================================================================
  logout = asyncHandler(async (req, res) => {
    clearAuthCookies(res, JWT_TOKEN.ACCESS_TOKEN);
    clearAuthCookies(res, JWT_TOKEN.REFRESH_TOKEN);

    const successResponse: IApiResponse<Partial<IAuthResponseDTO>> = {
      success: SUCCESS_STATUS.SUCCESS,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    };

    res.status(HTTP_STATUS.OK).json(successResponse);
  });
}
