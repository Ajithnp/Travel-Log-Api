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
    key: z.string({ required_error: "Icon key required" }).trim(),
  },{
    invalid_type_error: "Input type error",
    required_error: "Icon is required",
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

// update
export const updateCategoryBodySchema = z.object({
  description:categoryDescription,
  icon:categoryIcon,
}).refine(
  data => Object.values(data).some(v => v !== undefined),
  { message: 'At least one field must be provided for update' }
)


export const updateCategorySchema = z.object({
    params: z.object({id: z.string(),}),
    body: updateCategoryBodySchema,
});