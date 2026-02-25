import { Document, Types } from "mongoose";
import { IFiles } from "./vendor.info.entity";

export interface ICategory extends Document {
  name: string;
  icon?: IFiles; 
  description?: string;
  isActive: boolean;
  createdBy: Types.ObjectId; // Admin ObjectId reference
  createdAt: Date;
  updatedAt: Date;
}