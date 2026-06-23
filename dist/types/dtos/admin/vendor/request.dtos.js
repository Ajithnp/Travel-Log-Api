"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVendorVerificationSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const vendor_verfication_status_enum_1 = require("../../../../types/enum/vendor-verfication-status.enum");
/**
 * Reusable ObjectId validator
 */
const objectIdSchema = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid vendor id',
});
exports.UpdateVendorVerificationSchema = zod_1.z
    .object({
    params: zod_1.z.object({
        vendorId: objectIdSchema,
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(vendor_verfication_status_enum_1.ADMIN_VENDOR_VERIFICATION_STATUS),
        reasonForReject: zod_1.z.string().trim().min(1, 'Reason for rejection cannot be empty').optional(),
    }),
})
    .superRefine((data, ctx) => {
    const { status, reasonForReject } = data.body;
    // If REJECTED → reason is mandatory
    if (status === vendor_verfication_status_enum_1.ADMIN_VENDOR_VERIFICATION_STATUS.REJECTED && !reasonForReject) {
        ctx.addIssue({
            path: ['body', 'reasonForReject'],
            message: 'Reason is required when vendor verification is rejected',
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
    // If APPROVED → reason must NOT be sent
    if (status === vendor_verfication_status_enum_1.ADMIN_VENDOR_VERIFICATION_STATUS.APPROVED && reasonForReject) {
        ctx.addIssue({
            path: ['body', 'reasonForReject'],
            message: 'Reason should not be provided when vendor is approved',
            code: zod_1.z.ZodIssueCode.custom,
        });
    }
});
