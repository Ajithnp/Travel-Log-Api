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
  .object({
    key: z.string().trim(),
  })
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


