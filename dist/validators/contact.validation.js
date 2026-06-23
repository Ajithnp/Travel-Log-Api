"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFormRequestSchema = void 0;
const zod_1 = require("zod");
const contactFormSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: 'Name is required' })
        .trim()
        .min(3, 'Name must be at least 3 characters')
        .max(20, 'Name must not exceed 20 characters'),
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .trim()
        .email('Please enter a valid email address')
        .toLowerCase(),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number')
        .optional()
        .or(zod_1.z.literal('')),
    subject: zod_1.z
        .string({ required_error: 'Subject is required' })
        .trim()
        .min(5, 'Subject must be at least 5 characters')
        .max(100, 'Subject must not exceed 100 characters'),
    message: zod_1.z
        .string({ required_error: 'Message is required' })
        .trim()
        .min(10, 'Message must be at least 10 characters')
        .max(1000, 'Message must not exceed 1000 characters'),
});
exports.contactFormRequestSchema = zod_1.z.object({
    body: contactFormSchema,
});
