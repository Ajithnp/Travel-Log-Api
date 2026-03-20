import { z } from 'zod';

const VALID_SORTS = ['newest', 'price_low_high', 'price_high_low', 'top_rated'] as const;
const VALID_RATINGS = [3, 3.5, 4, 4.5] as const;
const VALID_DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Extreme'] as const;

export const publicPackageQuerySchema = z.object({
  query: z
    .object({
      search: z.string().trim().optional(),

      category: z.string().min(1).optional(),

      difficulty: z.enum(VALID_DIFFICULTIES).optional(),

      sort: z.enum(VALID_SORTS).default('newest'),

      minPrice: z.coerce.number().int().min(0).optional(),
      maxPrice: z.coerce.number().int().min(0).optional(),

      minRating: z.coerce
        .number()
        .refine((v) => (VALID_RATINGS as readonly number[]).includes(v), {
          message: 'minRating must be one of: 3, 3.5, 4, 4.5',
        })
        .optional(),

      minDuration: z.coerce.number().int().min(1).optional(),
      maxDuration: z.coerce.number().int().min(1).optional(),

      startDate: z.string().date('startDate must be a valid date (YYYY-MM-DD)').optional(),
      endDate: z.string().date('endDate must be a valid date (YYYY-MM-DD)').optional(),

      page: z.coerce.number(),
      limit: z.coerce.number(),
    })
    // ── Cross-field validations ───────────────────────────────────────────────
    .refine(
      (q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice,
      { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] },
    )
    .refine(
      (q) =>
        q.minDuration === undefined ||
        q.maxDuration === undefined ||
        q.minDuration <= q.maxDuration,
      { message: 'minDuration cannot be greater than maxDuration', path: ['minDuration'] },
    )
    .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
      message: 'startDate cannot be after endDate',
      path: ['startDate'],
    }),
});

export type PublicPackageQuery = z.infer<typeof publicPackageQuerySchema>['query'];
