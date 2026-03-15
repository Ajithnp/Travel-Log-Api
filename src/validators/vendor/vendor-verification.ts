import { z } from "zod";


export const uploadedFileSchema = z.object({
  fieldName: z.string().trim().min(1, 'File field name is required'),

  key: z.string().trim().min(1, 'File key is required'),
});

const REQUIRED_VERIFICATION_FILES = ['businessLicence', 'businessPan', 'companyLogo'] as const;



export const VendorVerificationBodySchema = z.object({
  gstin: z
    .string()
    .min(1, "GSTIN is required")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format"),
  ownerName:
    z.string().min(1, "Owner name is required")
      .min(2, "Owner name must be at least 2 characters")
      .max(15, "Owner name cannot exceed 15 characters"),
  businessAddress: z
    .string()
    .min(1, "Business address is required")
    .min(5, "Business address must be at least 5 characters"),
  
  accountNumber: z
  .string()
  .min(9, "Account number must be at least 9 digits")
  .max(18, "Account number cannot exceed 18 digits")
  .regex(/^[0-9]+$/, "Account number must contain only digits")
  .transform((val) => val.replace(/\s+/g, "")),

  ifsc: z
  .string()
  .min(11, "IFSC must be 11 characters")
  .max(11, "IFSC must be exactly 11 characters")
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format")
  .transform((val) => val.toUpperCase()),

  accountHolderName: z
  .string()
  .min(2, "Account holder name must be at least 2 characters")
  .max(50, "Account holder name cannot exceed 50 characters")
  .regex(/^[A-Za-z.\s]+$/, "Name can only contain letters and spaces"),
  
 bankName: z.string().min(1, "Bank name is required (enter a valid IFSC)"),
 branch: z.string().min(1, "Branch is required (enter a valid IFSC)"),

  files: z
    .array(
      z.object({
        fieldName: z.string().min(1, 'Field name is required'),
        key: z.string().min(1, 'File key is required'),
      }),
    )
    .min(1, 'At least one file must be uploaded'),
});

export const VendorVerificationSchema = z
  .object({
    body:VendorVerificationBodySchema
  })
  .superRefine((data, ctx) => {
    const uploadedFields = new Set(data.body.files.map((file) => file.fieldName));

    const missingFiles = REQUIRED_VERIFICATION_FILES.filter(
      (required) => !uploadedFields.has(required),
    );

    if (missingFiles.length > 0) {
      ctx.addIssue({
        path: ['body', 'files'],
        message: `Missing required files: ${missingFiles.join(', ')}`,
        code: z.ZodIssueCode.custom,
      });
    }
  });

export type UpdateProfileLogoRequestDTO = z.infer<typeof VendorVerificationBodySchema>;