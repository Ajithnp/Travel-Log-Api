import { Document, Types } from "mongoose";


export type UserRole = "admin" | "user" | "vendor";

export interface IUser extends Document{
    _id: Types.ObjectId
    id?: string ; 
    name: string;
    email: string;
    phone: string;
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
