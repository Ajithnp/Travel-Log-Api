import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId',
});

export const createOfferSchema = z.object({
  body: z.object({
    packageId: objectIdSchema,
    scheduleId: objectIdSchema.optional(),
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    discountType: z.literal('percentage', {
      errorMap: () => ({ message: 'Discount type must be percentage' }),
    }),
    discountValue: z.number().min(1).max(100, 'Percentage cannot exceed 100'),
    maxDiscountCap: z.number().min(1).optional(),
    minBookingAmount: z.number().min(1).optional(),
    usageLimit: z.number().int().min(1).optional(),
    validFrom: z.coerce.date(),
    validUntil: z.coerce.date(),
  }),
});

export const getVendorOffersQuerySchema = z.object({
  query: z.object({
    isActive: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    packageId: objectIdSchema.optional(),
  }),
});
