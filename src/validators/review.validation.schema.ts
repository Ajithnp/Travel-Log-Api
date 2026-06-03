import { z } from 'zod';

const ratingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5')
  .describe('Rating must be an integer between 1 and 5');

const reviewTextSchema = z
  .string()
  .min(20, 'Review text must be at least 20 characters')
  .max(1000, 'Review text must not exceed 1000 characters')
  .trim();

const reviewImageSchema = z
  .array(
    z.object({
      key: z.string().min(1, 'Image key is required'),
    }),
  )
  .optional()
  .describe('Array of image objects with key');

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required'),
    rating: ratingSchema,
    text: reviewTextSchema,
    images: reviewImageSchema,
  }),
});
