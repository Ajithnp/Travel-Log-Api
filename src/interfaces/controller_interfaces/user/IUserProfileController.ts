import { RequestHandler } from "express";

export interface IUserProfileController {
  profile: RequestHandler
  updateProfile: RequestHandler
  resetPassword: RequestHandler
  updateEmailRequest: RequestHandler
  updateEmail: RequestHandler
}