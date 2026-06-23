"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicPackageQuerySchema = void 0;
const zod_1 = require("zod");
const VALID_SORTS = ['newest', 'price_low_high', 'price_high_low', 'top_rated', 'offered'];
const VALID_RATINGS = [3, 3.5, 4, 4.5];
const VALID_DIFFICULTIES = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
exports.publicPackageQuerySchema = zod_1.z.object({
    query: zod_1.z
        .object({
        search: zod_1.z.string().trim().optional(),
        category: zod_1.z.string().min(1).optional(),
        difficulty: zod_1.z.enum(VALID_DIFFICULTIES).optional(),
        sort: zod_1.z.enum(VALID_SORTS).default('newest'),
        minPrice: zod_1.z.coerce.number().int().min(0).optional(),
        maxPrice: zod_1.z.coerce.number().int().min(0).optional(),
        minRating: zod_1.z.coerce
            .number()
            .refine((v) => VALID_RATINGS.includes(v), {
            message: 'minRating must be one of: 3, 3.5, 4, 4.5',
        })
            .optional(),
        minDuration: zod_1.z.coerce.number().int().min(1).optional(),
        maxDuration: zod_1.z.coerce.number().int().min(1).optional(),
        startDate: zod_1.z.string().date('startDate must be a valid date (YYYY-MM-DD)').optional(),
        endDate: zod_1.z.string().date('endDate must be a valid date (YYYY-MM-DD)').optional(),
        page: zod_1.z.coerce.number(),
        limit: zod_1.z.coerce.number(),
    })
        .refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, { message: 'minPrice cannot be greater than maxPrice', path: ['minPrice'] })
        .refine((q) => q.minDuration === undefined ||
        q.maxDuration === undefined ||
        q.minDuration <= q.maxDuration, { message: 'minDuration cannot be greater than maxDuration', path: ['minDuration'] })
        .refine((q) => !q.startDate || !q.endDate || q.startDate <= q.endDate, {
        message: 'startDate cannot be after endDate',
        path: ['startDate'],
    }),
});
