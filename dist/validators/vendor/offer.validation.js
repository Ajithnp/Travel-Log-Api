"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorOffersQuerySchema = exports.createOfferSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const objectIdSchema = zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
});
exports.createOfferSchema = zod_1.z.object({
    body: zod_1.z.object({
        packageId: objectIdSchema,
        scheduleId: objectIdSchema.optional(),
        name: zod_1.z.string().trim().min(3, 'Name must be at least 3 characters'),
        discountType: zod_1.z.literal('percentage', {
            errorMap: () => ({ message: 'Discount type must be percentage' }),
        }),
        discountValue: zod_1.z.number().min(1).max(100, 'Percentage cannot exceed 100'),
        usageLimit: zod_1.z.number().int().min(1).optional(),
        validUntil: zod_1.z.coerce.date().refine((date) => date > new Date(), {
            message: 'validUntil must be a future date',
        }),
    }),
});
exports.getVendorOffersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        isActive: zod_1.z
            .string()
            .optional()
            .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
        packageId: objectIdSchema.optional(),
    }),
});
