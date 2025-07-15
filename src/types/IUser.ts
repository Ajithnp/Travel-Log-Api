import { Document } from "mongoose";


export type UserRole = "admin" | "user";

export interface IUser extends Document{
    name: string;
    email: string;
    phone?: string;
    googleId: string;
    password: string;
    profile?: string;
    isEmailVerified: boolean;
    isActive: boolean;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    
}
