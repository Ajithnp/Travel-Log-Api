import { Document } from "mongoose";

export interface IOtp extends Document {
    otp: string;
    email: string;
    expiresAt: Date;
}