"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatbotQueryRequestSchema = exports.chatbotQuerySchema = void 0;
const zod_1 = require("zod");
exports.chatbotQuerySchema = zod_1.z.object({
    message: zod_1.z
        .string({ required_error: 'Message is required' })
        .trim()
        .min(2, 'Message must be at least 2 characters')
        .max(500, 'Message must not exceed 500 characters'),
    chatHistory: zod_1.z
        .array(zod_1.z.object({
        role: zod_1.z.enum(['user', 'assistant']),
        content: zod_1.z.string(),
    }))
        .optional(),
});
exports.chatbotQueryRequestSchema = zod_1.z.object({
    body: exports.chatbotQuerySchema,
});
