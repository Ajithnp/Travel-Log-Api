import { z } from 'zod';

export const VendorVerificationSchema = z.object({
  ownerName: z.string().min(1, 'Name is required'),
  businessAddress: z.string().min(1, 'Address is required'),
  gstin: z
    .string()
    .min(15, 'GST number must be at least 15 characters')
    .max(15, 'GST number must be 15 characters'),
  files: z
    .array(
      z.object({
        fieldName: z.string().min(1, 'Field name is required'),
        key: z.string().min(1, 'File key is required'),
      }),
    )
    .min(1, 'At least one file must be uploaded'),
});
export type VendorVerificationRequestDTO = z.infer<typeof VendorVerificationSchema>;

export const updateProfileLogoSchema = z.object({
  vendorInfoId: z.string().min(1, 'vendor data is required'),
  files: z
    .array(
      z.object({
        fieldName: z.string().min(1, 'Field name is required'),
        key: z.string().min(1, 'File key is required'),
      }),
    )
    .min(1, 'At least one file must be uploaded'),
});
export type UpdateProfileLogoRequestDTO = z.infer<typeof updateProfileLogoSchema>;
