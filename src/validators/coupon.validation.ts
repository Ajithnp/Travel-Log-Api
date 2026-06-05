import { z } from 'zod';

const titleSchema = z
  .string()
  .min(3, 'Title must be at least 3 characters long')
  .max(100, 'Title must not exceed 100 characters')
  .trim();

const rewardValueSchema = z
  .number({
    required_error: 'Reward value is required',
    invalid_type_error: 'Reward value must be a number',
  })
  .positive('Reward value must be greater than 0');

const probabilitySchema = z
  .number({
    required_error: 'Probability is required',
    invalid_type_error: 'Probability must be a number',
  })
  .min(0, 'Probability cannot be less than 0')
  .max(1, 'Probability cannot be greater than 1')
  .describe('Must be a decimal between 0 and 1 representing percentage chance');

export const couponTemplateRequestSchema = z.object({
  body: z.object({
    title: titleSchema,
    rewardValue: rewardValueSchema,
    probability: probabilitySchema,
  }),
});
