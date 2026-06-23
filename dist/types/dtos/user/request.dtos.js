"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileSchema = exports.ResetPasswordSchema = exports.UpdateEmailSchema = exports.ChangeEmailRequestSchema = exports.UpdateEmailRequestSchema = void 0;
const zod_1 = require("zod");
exports.UpdateEmailRequestSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
});
exports.ChangeEmailRequestSchema = zod_1.z.object({
    body: exports.UpdateEmailRequestSchema,
});
exports.UpdateEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
        otp: zod_1.z
            .string()
            .min(6, 'OTP must be 6 digits')
            .max(6, 'OTP must be 6 digits')
            .nonempty('OTP is required'),
    }),
});
exports.ResetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        oldPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
        newPassword: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    }),
});
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(3, 'Name must be at least 3 characters long')
        .regex(/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces')
        .optional(),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^\d{10}$/, 'Phone number must be a valid 10-digit number')
        .optional(),
});
