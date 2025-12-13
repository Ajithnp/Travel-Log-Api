import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Reusable ObjectId validator
 */
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid user id',
});

export const BlockOrUnblockUserSchema = z
  .object({
    params: z.object({
      userId: objectIdSchema,
    }),

    body: z.object({
      blockUser: z.boolean(),

      reason: z.string().trim().min(1, 'Reason cannot be empty').optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.body.blockUser && !data.body.reason) {
      ctx.addIssue({
        path: ['body', 'reason'],
        message: 'Reason is required when blocking a user',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type BlockUnblockUserDTO = z.infer<typeof BlockOrUnblockUserSchema>;
