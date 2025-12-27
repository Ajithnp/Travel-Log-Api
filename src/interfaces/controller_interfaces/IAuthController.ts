import { RequestHandler } from 'express';
export interface IAuthController {
  registerUser: RequestHandler;
  loginUser: RequestHandler;
  verifyEmail: RequestHandler;
  resendOtp: RequestHandler;
  verifyOtp: RequestHandler;
  googleAuthCallback: RequestHandler;
  forgotPassword: RequestHandler;
  changePassword: RequestHandler;
  refreshAccessToken: RequestHandler;
  logout: RequestHandler;
}
