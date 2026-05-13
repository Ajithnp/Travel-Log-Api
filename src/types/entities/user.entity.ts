import { Document, Types } from 'mongoose';
import { USER_ROLES } from 'shared/constants/roles';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface IUser extends Document {
  _id: Types.ObjectId;
  id?: string;
  name: string;
  email: string;
  phone: string;
  authProvider: 'local' | 'google';
  googleId: string;
  password: string;
  profile?: string;
  isEmailVerified: boolean;
  isBlocked: boolean;
  blockedReason: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
