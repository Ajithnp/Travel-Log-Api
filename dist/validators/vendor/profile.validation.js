"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileLogoRequestSchema = exports.updateProfileLogoSchema = void 0;
const zod_1 = require("zod");
const vendor_verification_1 = require("./vendor-verification");
exports.updateProfileLogoSchema = zod_1.z
    .object({
    vendorInfoId: zod_1.z.string().min(1, 'vendor data is required'),
    files: zod_1.z.array(vendor_verification_1.uploadedFileSchema).min(1, 'At least one file must be uploaded'),
})
    .superRefine((data, ctx) => {
    const hasProfileLogo = data.files.some((file) => file.fieldName === 'profileLogo');
    if (!hasProfileLogo) {
        ctx.addIssue({
            path: ['files'],
            message: 'Profile logo file is required',
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
exports.UpdateProfileLogoRequestSchema = zod_1.z.object({
    body: exports.updateProfileLogoSchema,
});
