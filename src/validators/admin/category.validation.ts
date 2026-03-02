import { z } from 'zod';
const categoryName = z
  .string({ required_error: 'Category name is required' })
  .trim()
  .min(2, 'Category name must be at least 2 characters')
  .max(60, 'Category name cannot exceed 60 characters');

const categoryDescription = z
  .string()
  .trim()
  .max(300, 'Description cannot exceed 300 characters')
  .optional();

const categoryIcon = z
  .object(
    {
      key: z.string({ required_error: 'Icon key required' }).trim(),
    },
    {
      invalid_type_error: 'Input type error',
      required_error: 'Icon is required',
    },
  )
  .optional();

// create

const createCategoryBodySchema = z.object({
  name: categoryName,
  description: categoryDescription,
  icon: categoryIcon,
});

export const createCategorySchema = z.object({
  body: createCategoryBodySchema,
});

// update
export const updateCategoryBodySchema = z
  .object({
    description: categoryDescription,
    icon: categoryIcon,
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided for update',
  });

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string() }),
  body: updateCategoryBodySchema,
});

//=============================
export const reviewCategoryBodySchema = z
  .object({
    action: z.enum(['approve', 'rejected'], {
      required_error: 'action is required',
      invalid_type_error: 'action must be "approve" or "reject"',
    }),
    rejectionReason: z
      .string()
      .trim()
      .min(10, 'Rejection reason must be at least 10 characters')
      .max(500, 'Rejection reason cannot exceed 500 characters')
      .optional(),
  })
  .refine((data) => !(data.action === 'rejected' && !data.rejectionReason?.trim()), {
    message: 'rejectionReason is required when action is "reject"',
    path: ['rejectionReason'],
  });

export const reviewCategorySchema = z.object({
  params: z.object({ id: z.string() }),
  body: reviewCategoryBodySchema,
});

//=============================
export const reviewedCategoryBodySchema = z
  .object({
    selectedFilter: z
      .enum(['active', 'rejected'], {
        message: 'Filter must be "active" or "rejected"',
      })
      .optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  })
  .strict();

export const reviewedCategorySchema = z.object({
  query: reviewedCategoryBodySchema,
});
//=================================================
