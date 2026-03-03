import { z } from 'zod';

export const getRequestedCategoryBodySchema = z
  .object({
    selectedFilter: z
      .enum(['active', 'rejected', 'pending'], {
        message: 'Filter must be "active" or "rejected"',
      })
      .optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  })
  .strict();

export const getRequestedCategorySchema = z.object({
  query: getRequestedCategoryBodySchema,
});
