import { Document } from "mongoose";


export type UserRole = "admin" | "user" | "vendor";

export interface IUser extends Document{
    id?: string;
    name: string;
    email: string;
    phone?: string;
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
