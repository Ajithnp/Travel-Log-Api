import { Document } from "mongoose";

export interface IResetPassword extends Document {
  userId: string, //email
  token: string,
  expiresAt: Date
}