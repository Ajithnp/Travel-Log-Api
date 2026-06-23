"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyStatusRequestSchema = exports.PolicyStatusSchema = exports.UpdateCancellationPolicySchema = exports.CancellationPolicyRequestSchema = exports.CreateCancellationPolicySchema = exports.CancellationRuleSchema = void 0;
const zod_1 = require("zod");
exports.CancellationRuleSchema = zod_1.z.object({
    daysBeforeTrip: zod_1.z
        .number({ required_error: 'daysBeforeTrip is required' })
        .int('daysBeforeTrip must be an integer')
        .min(0, 'daysBeforeTrip cannot be negative'),
    refundPercent: zod_1.z
        .number({ required_error: 'refundPercent is required' })
        .min(0, 'refundPercent must be at least 0')
        .max(100, 'refundPercent cannot exceed 100'),
});
exports.CreateCancellationPolicySchema = zod_1.z.object({
    key: zod_1.z
        .string({ required_error: 'key is required' })
        .min(1)
        .max(50)
        .regex(/^[a-z0-9_]+$/, 'key must be lowercase letters, numbers, or underscores'),
    label: zod_1.z.string({ required_error: 'label is required' }).min(1, 'label cannot be empty').max(100),
    description: zod_1.z.string().max(500).optional(),
    rules: zod_1.z
        .array(exports.CancellationRuleSchema)
        .min(1, 'At least one rule is required')
        .max(10, 'Maximum 10 rules allowed')
        .refine((rules) => {
        const days = rules.map((r) => r.daysBeforeTrip);
        return new Set(days).size === days.length;
    }, { message: 'Each rule must have a unique daysBeforeTrip value' }),
});
exports.CancellationPolicyRequestSchema = zod_1.z.object({
    body: exports.CreateCancellationPolicySchema,
});
exports.UpdateCancellationPolicySchema = zod_1.z
    .object({
    label: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().max(500).optional(),
    rules: zod_1.z
        .array(exports.CancellationRuleSchema)
        .min(1, 'At least one rule is required')
        .max(10)
        .refine((rules) => {
        const days = rules.map((r) => r.daysBeforeTrip);
        return new Set(days).size === days.length;
    }, { message: 'Each rule must have a unique daysBeforeTrip value' })
        .optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
});
exports.PolicyStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean({ required_error: 'isActive is required' }),
});
exports.PolicyStatusRequestSchema = zod_1.z.object({
    body: exports.PolicyStatusSchema,
});
