"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCategorySchema = exports.requestCategorySchemaBody = exports.reviewedCategorySchema = exports.reviewedCategoryBodySchema = exports.reviewCategorySchema = exports.reviewCategoryBodySchema = exports.updateCategorySchema = exports.updateCategoryBodySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
const categoryName = zod_1.z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(2, 'Category name must be at least 2 characters')
    .max(60, 'Category name cannot exceed 60 characters');
const categoryDescription = zod_1.z
    .string()
    .trim()
    .max(300, 'Description cannot exceed 300 characters')
    .optional();
const vendorNote = zod_1.z
    .string()
    .trim()
    .min(5, 'Category name must be at least 5 characters')
    .max(100, 'Description cannot exceed 300 characters');
const categoryIcon = zod_1.z
    .object({
    key: zod_1.z.string({ required_error: 'Icon key required' }).trim(),
}, {
    invalid_type_error: 'Input type error',
    required_error: 'Icon is required',
})
    .optional();
const createCategoryBodySchema = zod_1.z.object({
    name: categoryName,
    description: categoryDescription,
    icon: categoryIcon,
});
exports.createCategorySchema = zod_1.z.object({
    body: createCategoryBodySchema,
});
exports.updateCategoryBodySchema = zod_1.z
    .object({
    description: categoryDescription,
    icon: categoryIcon,
})
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided for update',
});
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.updateCategoryBodySchema,
});
exports.reviewCategoryBodySchema = zod_1.z
    .object({
    action: zod_1.z.enum(['approve', 'rejected'], {
        required_error: 'action is required',
        invalid_type_error: 'action must be "approve" or "reject"',
    }),
    rejectionReason: zod_1.z
        .string()
        .trim()
        .min(10, 'Rejection reason must be at least 10 characters')
        .max(500, 'Rejection reason cannot exceed 500 characters')
        .optional(),
})
    .refine((data) => { var _a; return !(data.action === 'rejected' && !((_a = data.rejectionReason) === null || _a === void 0 ? void 0 : _a.trim())); }, {
    message: 'rejectionReason is required when action is "reject"',
    path: ['rejectionReason'],
});
exports.reviewCategorySchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string() }),
    body: exports.reviewCategoryBodySchema,
});
exports.reviewedCategoryBodySchema = zod_1.z
    .object({
    selectedFilter: zod_1.z
        .enum(['active', 'rejected'], {
        message: 'Filter must be "active" or "rejected"',
    })
        .optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
})
    .strict();
exports.reviewedCategorySchema = zod_1.z.object({
    query: exports.reviewedCategoryBodySchema,
});
exports.requestCategorySchemaBody = zod_1.z.object({
    name: categoryName,
    vendorNote: vendorNote,
});
exports.requestCategorySchema = zod_1.z.object({
    body: exports.requestCategorySchemaBody,
});
