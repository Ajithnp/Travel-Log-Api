import { model, Schema } from "mongoose";
import { IUser } from "../types/IUser";

const userSchema = new Schema<IUser>(
{
   name: {
    type: String,
    required: true,
   },
    email: {
     type: String,
     required: true,
     unique: true,
    },
    phone: {
     type: String,
     unique: true,
    },
     googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
     type: String,
   
    },
    profile: {
     type: String,
     default: "",
    },
    isEmailVerified: {
     type: Boolean,
     default: false,
    },
    isActive: {
     type: Boolean,
     default: true,
    },
    role: {
     type: String,
     enum: ["admin", "user", "guest"],
     default: "user",
    },

},{timestamps: true}
);

export const UserModel = model<IUser>("user", userSchema);