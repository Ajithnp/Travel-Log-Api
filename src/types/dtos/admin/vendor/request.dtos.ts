import { z } from 'zod';
import mongoose from 'mongoose';
import { ADMIN_VENDOR_VERIFICATION_STATUS } from '../../../../types/enum/vendor-verfication-status.enum';

/**
 * Reusable ObjectId validator
 */
const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid vendor id',
});

export const UpdateVendorVerificationSchema = z
  .object({
    params: z.object({
      vendorId: objectIdSchema,
    }),

    body: z.object({
      status: z.nativeEnum(ADMIN_VENDOR_VERIFICATION_STATUS),

      reasonForReject: z.string().trim().min(1, 'Reason for rejection cannot be empty').optional(),
    }),
  })
  .superRefine((data, ctx) => {
    const { status, reasonForReject } = data.body;

    // If REJECTED → reason is mandatory
    if (status === ADMIN_VENDOR_VERIFICATION_STATUS.REJECTED && !reasonForReject) {
      ctx.addIssue({
        path: ['body', 'reasonForReject'],
        message: 'Reason is required when vendor verification is rejected',
        code: z.ZodIssueCode.custom,
      });
    }

    // If APPROVED → reason must NOT be sent
    if (status === ADMIN_VENDOR_VERIFICATION_STATUS.APPROVED && reasonForReject) {
      ctx.addIssue({
        path: ['body', 'reasonForReject'],
        message: 'Reason should not be provided when vendor is approved',
        code: z.ZodIssueCode.custom,
      });
    }
  });
