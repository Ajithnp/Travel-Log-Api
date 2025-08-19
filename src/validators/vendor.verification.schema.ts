import { z } from "zod";


const FileSchema = z.object({
  url: z.string().url(),
  fileType: z.enum(["pdf", "image"]),
  size: z.number().positive().max(10 * 1024 * 1024), // Max 10MB
  checksum: z.string().optional(),
});

// Vendor Verification Schema
export const VendorVerificationSchema = z.object({
  businessLicence: FileSchema.refine(
    (file) => file.fileType === "pdf",
    "Business Licence must be a PDF file"
  ),
  businessPan: FileSchema.refine(
    (file) => file.fileType === "image",
    "Business PAN must be an image file"
  ),
  companyLogo: FileSchema.refine(
    (file) => file.fileType === "image",
    "Company Logo must be an image file"
  ),
  gstin: z
    .string()
    .length(15)
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format"
    ),
  address: z
    .string()
    .min(5, "Address too short")
    .max(300, "Address too long"),
  ownerName: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[A-Za-z ]+$/, "Owner name must contain only alphabets and spaces"),
});

export type VendorVerificationDTO = z.infer<typeof VendorVerificationSchema>;
