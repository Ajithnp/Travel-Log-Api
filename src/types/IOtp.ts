import { Document , Types} from "mongoose";

export interface IOtp extends Document {
    _id: Types.ObjectId
    otp: string;
    email: string;
    expiresAt: Date;
}