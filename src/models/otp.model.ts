import { model, Schema } from "mongoose";
import { IOtp } from "../types/IOtp";

export const otpSchema = new Schema<IOtp>(
    {
        otp: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            expires: 0, // Automatically remove the document after 0 seconds!
        }
    },
    { timestamps: true
    }
)

export const OtpModel = model<IOtp>("otp", otpSchema);