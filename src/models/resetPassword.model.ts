import { model, Schema } from "mongoose";
import { IResetPassword } from "../types/IResetPassword";

const resetPasswordSchema = new Schema<IResetPassword>({
    userId: {
        type: String,
        required:true
    },
    token:{
        type: String,
        required:true
    },
    expiresAt:{
        type: Date,
        required: true,
        //TTL indexing
        index: {expires: 0}, 
    },
});

export const ResetPassword = model<IResetPassword>("ResetPassword", resetPasswordSchema);