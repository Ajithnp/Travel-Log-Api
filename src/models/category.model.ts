import { ICategory } from "types/entities/category.entity";
import mongoose, { Schema, Types } from "mongoose";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    icon: {
    key: String,
    fieldName: String,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ isActive: 1, name: 1 });

export const CategoryModel = mongoose.model<ICategory>("Category", categorySchema);

