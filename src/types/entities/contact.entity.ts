import { Document, Types } from "mongoose";
import { ContactStatus } from "../../shared/constants/constants";



export interface IContact extends Document {
    _id:Types.ObjectId;
    userId?:Types.ObjectId | null;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isGuest: boolean;
    status : ContactStatus
    createdAt:Date;
    updatedAt:Date;

};