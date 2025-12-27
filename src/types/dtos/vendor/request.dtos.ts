import { z } from 'zod';

/**
 * Single uploaded file schema
 */
const uploadedFileSchema = z.object({
  fieldName: z
    .string()
    .trim()
    .min(1, "File field name is required"),

  key: z
    .string()
    .trim()
    .min(1, "File key is required"),
});

/**
 * Required verification file fields
 */

const REQUIRED_VERIFICATION_FILES = [
  "businessLicence",
  "businessPan",
  "companyLogo",
] as const;

/**
 * Vendor verification request schema (request-level)
 */

export const VendorVerificationSchema = z
  .object({
    body: z.object({
      ownerName: z
        .string()
        .trim()
        .min(1, "Owner name is required"),

      businessAddress: z
        .string()
        .trim()
        .min(1, "Business address is required"),

      gstin: z
        .string()
        .trim()
        .length(15, "GST number must be exactly 15 characters"),

      files: z
        .array(uploadedFileSchema)
        .min(1, "At least one file must be uploaded"),
    }),
  })
  .superRefine((data, ctx) => {
    const uploadedFields = new Set(
      data.body.files.map((file) => file.fieldName)
    );

    const missingFiles = REQUIRED_VERIFICATION_FILES.filter(
      (required) => !uploadedFields.has(required)
    );

    if (missingFiles.length > 0) {
      ctx.addIssue({
        path: ["body", "files"],
        message: `Missing required files: ${missingFiles.join(", ")}`,
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const VendorVerificationSchema2 = z.object({
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

interface VendorVerificationFile {
  fieldName: string;
  key: string;
}

export interface VendorVerificationRequestDTO {
  files: VendorVerificationFile[];
  ownerName: string;
  businessAddress: string;
  gstin: string;
}




/**
 * Update profile logo schema
 */
export const updateProfileLogoSchema = z
  .object({
   vendorInfoId: z.string().min(1, 'vendor data is required'),
    files: z
      .array(uploadedFileSchema)
      .min(1, "At least one file must be uploaded"),
  })
  .superRefine((data, ctx) => {
    const hasProfileLogo = data.files.some(
      (file) => file.fieldName === "profileLogo"
    );

    if (!hasProfileLogo) {
      ctx.addIssue({
        path: ["files"],
        message: "Profile logo file is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });

export const UpdateProfileLogoRequestSchema = z.object({
  body: updateProfileLogoSchema,
});

export type UpdateProfileLogoRequestDTO = z.infer<typeof updateProfileLogoSchema>;
