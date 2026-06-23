"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorVerificationSchema = exports.VendorVerificationBodySchema = exports.uploadedFileSchema = void 0;
const zod_1 = require("zod");
exports.uploadedFileSchema = zod_1.z.object({
    fieldName: zod_1.z.string().trim().min(1, 'File field name is required'),
    key: zod_1.z.string().trim().min(1, 'File key is required'),
});
const REQUIRED_VERIFICATION_FILES = ['businessLicence', 'businessPan', 'companyLogo'];
exports.VendorVerificationBodySchema = zod_1.z.object({
    gstin: zod_1.z
        .string()
        .min(1, 'GSTIN is required')
        .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format'),
    ownerName: zod_1.z
        .string()
        .min(1, 'Owner name is required')
        .min(2, 'Owner name must be at least 2 characters')
        .max(15, 'Owner name cannot exceed 15 characters'),
    businessAddress: zod_1.z
        .string()
        .min(1, 'Business address is required')
        .min(5, 'Business address must be at least 5 characters'),
    bio: zod_1.z.string().min(1, 'Bio is required').min(15, 'Bio must be at least 15 characters'),
    accountNumber: zod_1.z
        .string()
        .min(9, 'Account number must be at least 9 digits')
        .max(18, 'Account number cannot exceed 18 digits')
        .regex(/^[0-9]+$/, 'Account number must contain only digits')
        .transform((val) => val.replace(/\s+/g, '')),
    ifsc: zod_1.z
        .string()
        .min(11, 'IFSC must be 11 characters')
        .max(11, 'IFSC must be exactly 11 characters')
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format')
        .transform((val) => val.toUpperCase()),
    accountHolderName: zod_1.z
        .string()
        .min(2, 'Account holder name must be at least 2 characters')
        .max(50, 'Account holder name cannot exceed 50 characters')
        .regex(/^[A-Za-z.\s]+$/, 'Name can only contain letters and spaces'),
    bankName: zod_1.z.string().min(1, 'Bank name is required (enter a valid IFSC)'),
    branch: zod_1.z.string().min(1, 'Branch is required (enter a valid IFSC)'),
    files: zod_1.z
        .array(zod_1.z.object({
        fieldName: zod_1.z.string().min(1, 'Field name is required'),
        key: zod_1.z.string().min(1, 'File key is required'),
    }))
        .min(1, 'At least one file must be uploaded'),
});
exports.VendorVerificationSchema = zod_1.z
    .object({
    body: exports.VendorVerificationBodySchema,
})
    .superRefine((data, ctx) => {
    const uploadedFields = new Set(data.body.files.map((file) => file.fieldName));
    const missingFiles = REQUIRED_VERIFICATION_FILES.filter((required) => !uploadedFields.has(required));
    if (missingFiles.length > 0) {
        ctx.addIssue({
            path: ['body', 'files'],
            message: `Missing required files: ${missingFiles.join(', ')}`,
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
