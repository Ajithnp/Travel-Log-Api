"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = void 0;
const zod_1 = require("zod");
const ratingSchema = zod_1.z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .describe('Rating must be an integer between 1 and 5');
const reviewTextSchema = zod_1.z
    .string()
    .min(20, 'Review text must be at least 20 characters')
    .max(1000, 'Review text must not exceed 1000 characters')
    .trim();
const reviewImageSchema = zod_1.z
    .array(zod_1.z.object({
    key: zod_1.z.string().min(1, 'Image key is required'),
}))
    .optional()
    .describe('Array of image objects with key');
exports.createReviewSchema = zod_1.z.object({
    body: zod_1.z.object({
        bookingId: zod_1.z.string().min(1, 'Booking ID is required'),
        rating: ratingSchema,
        text: reviewTextSchema,
        images: reviewImageSchema,
    }),
});
