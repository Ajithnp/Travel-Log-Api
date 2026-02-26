import { ICategory } from '../types/entities/category.entity';
import mongoose, { Schema, Types } from 'mongoose';
import { CATEGORY_STATUS } from '../shared/constants/constants';
import { generateSlug } from '../shared/utils/slug.generator.helper';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    icon: {
       key: {
         type: String,
         trim: true,
      },
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: Object.values(CATEGORY_STATUS),
      required: true,
      default: CATEGORY_STATUS.PENDING,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);


CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ status: 1, isActive: 1 });
CategorySchema.index({ requestedBy: 1, status: 1 });

// ─── Pre-Save Hook — Auto-generate slug from name ────────────────
// Runs every time a new document is saved
CategorySchema.pre('save', function (next) {
  if (this.isNew || this.isModified('name')) {
    this.slug = generateSlug(this.name);
  }
  next();
});

export const CategoryModel = mongoose.model<ICategory>('Category', CategorySchema);
