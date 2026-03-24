import { z } from 'zod';
import { uploadedFileSchema } from './vendor-verification';

export const updateProfileLogoSchema = z
  .object({
    vendorInfoId: z.string().min(1, 'vendor data is required'),
    files: z.array(uploadedFileSchema).min(1, 'At least one file must be uploaded'),
  })
  .superRefine((data, ctx) => {
    const hasProfileLogo = data.files.some((file) => file.fieldName === 'profileLogo');

    if (!hasProfileLogo) {
      ctx.addIssue({
        path: ['files'],
        message: 'Profile logo file is required',
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const UpdateProfileLogoRequestSchema = z.object({
  body: updateProfileLogoSchema,
});

export type UpdateProfileLogoRequestDTO = z.infer<typeof updateProfileLogoSchema>;
