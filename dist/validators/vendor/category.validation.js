"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestedCategorySchema = exports.getRequestedCategoryBodySchema = void 0;
const zod_1 = require("zod");
exports.getRequestedCategoryBodySchema = zod_1.z
    .object({
    selectedFilter: zod_1.z
        .enum(['active', 'rejected', 'pending'], {
        message: 'Filter must be "active" or "rejected"',
    })
        .optional(),
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
})
    .strict();
exports.getRequestedCategorySchema = zod_1.z.object({
    query: exports.getRequestedCategoryBodySchema,
});
