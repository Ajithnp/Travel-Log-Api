import { PACKAGE_STATUS } from '../../../shared/constants/constants';
import z from 'zod';

export const CATEGORY_ENUM = [
  'weekend',
  'adventure',
  'family',
  'honeymoon',
  'cultural',
  'relaxation',
  'luxury',
] as const;

export const DIFFICULTY_ENUM = ['easy', 'moderate', 'hard', 'challenging', 'extreme'] as const;

export const ACTIVITY_TYPE_ENUM = [
  'travel',
  'meal',
  'stay',
  'sightseeing',
  'activity',
  'free',
  'tour',
  'transport',
  'accommodation',
] as const;

const basePackageBackendSchema = z.object({
  status: z.nativeEnum(PACKAGE_STATUS),
});

export const packageImageSchema = z.object({
  key: z.string(), // Present for existing images (S3 Key)
  file: z.instanceof(File).optional(),
  status: z.enum(['PENDING_UPLOAD', 'UPLOADED', 'REMOVED']),
});

const draftActivitySchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(ACTIVITY_TYPE_ENUM).optional(),
  included: z.boolean().optional(),
});

const draftItineraryDaySchema = z.object({
  title: z.string().optional(),
  dayNumber: z.number().optional(),
  activities: z.array(draftActivitySchema).optional(),
});

const draftPackageBackendSchema = basePackageBackendSchema.extend({
  title: z.string().min(3).optional(),
  location: z.string().optional(),
  usp: z.string().optional(),
  pickupLocation: z.string().optional(),
  description: z.string().optional(),

  images: z.array(packageImageSchema).optional(),
  itinerary: z.array(draftItineraryDaySchema).optional(),

  category: z.enum(CATEGORY_ENUM).optional(),
  difficultyLevel: z.enum(DIFFICULTY_ENUM).optional(),

  days: z.string().optional(),
  nights: z.string().optional(),
  basePrice: z.string().optional(),

  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  packingList: z.array(z.string()).optional(),

  cancellationPolicy: z.enum(['Flexible', 'Moderate', 'Strict', 'Non-Refundable']).optional(),

  isActive: z.boolean().optional(),

  status: z.literal(PACKAGE_STATUS.DRAFT),
});

export type CreateBasePackageDTO = z.infer<typeof draftPackageBackendSchema>;

const packageResponseSchema = draftPackageBackendSchema.extend({
  packageId: z.string(),
  vendorId: z.string(),
});

export type BasePackageResponseDTO = z.infer<typeof packageResponseSchema>;

//============ publish schema=====================

const createActivitySchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),

  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),

  title: z.string().min(2, 'Activity title is required'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),

  location: z.string().min(2, 'Activity location is required'),

  type: z.enum(ACTIVITY_TYPE_ENUM, {
    errorMap: () => ({ message: 'Please select a valid activity type' }),
  }),

  included: z.boolean(),
});

export const createItinerarySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(2, 'Day title is required'),
  activities: z.array(createActivitySchema).min(1, 'Each day must have at least one activity'),
});

export const publishPackageBackendSchema = basePackageBackendSchema
  .extend({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters'),

    location: z
      .string()
      .min(2, 'Location must be at least 2 characters')
      .max(100, 'Location must be at most 100 characters'),

    pickupLocation: z
      .string()
      .min(2, 'Pickup location must be at least 2 characters')
      .max(100, 'Pickup location must be at most 100 characters'),

    usp: z
      .string()
      .min(2, 'USP must be at least 2 characters')
      .max(100, 'USP must be at most 100 characters'),

    category: z.enum(CATEGORY_ENUM, {
      errorMap: () => ({ message: 'Please select a valid category' }),
    }),

    difficultyLevel: z.enum(DIFFICULTY_ENUM, {
      errorMap: () => ({ message: 'Please select a valid difficulty level' }),
    }),

    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be at most 1000 characters'),

    days: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, 'Days must be at least 1'),

    nights: z.string().min(1, 'Nights is required'),

    basePrice: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Give a valid price'),

    images: z
      .array(packageImageSchema)
      .min(4, 'Minimum 4 images required')
      .max(20, 'Maximum 20 images allowed'),

    itinerary: z.array(createItinerarySchema).min(1, 'At least one itinerary day is required'),

    inclusions: z.array(z.string().min(1)),

    exclusions: z.array(z.string().min(1)),
    packingList: z.array(z.string()),

    cancellationPolicy: z.enum(['Flexible', 'Moderate', 'Strict', 'Non-Refundable'], {
      errorMap: () => ({ message: 'Please select a valid cancellation policy' }),
    }),

    isActive: z.boolean(),

    status: z.literal(PACKAGE_STATUS.PUBLISHED),
  })
  .strict();

export const PackageCreateUnionSchema = z
  .object({
    body: z.discriminatedUnion('status', [draftPackageBackendSchema, publishPackageBackendSchema]),
  })
  .superRefine((data, ctx) => {
    const body = data.body;

    if (body.status !== PACKAGE_STATUS.PUBLISHED) return;

    if (Number(body.days) !== body.itinerary.length) {
      ctx.addIssue({
        path: ['body', 'days'],
        message: 'Days must match itinerary length',
        code: z.ZodIssueCode.custom,
      });
    }

    if (Number(body.nights) !== Math.max(Number(body.days) - 1, 0)) {
      ctx.addIssue({
        path: ['body', 'nights'],
        message: 'Nights should be days minus one',
        code: z.ZodIssueCode.custom,
      });
    }
  });
