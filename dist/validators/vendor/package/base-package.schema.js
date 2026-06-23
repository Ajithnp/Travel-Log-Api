"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageCreateUnionSchema = exports.publishPackageBackendSchema = exports.createItinerarySchema = exports.packageResponseSchema = exports.packageImageSchema = exports.DIFFICULTY_ENUM = void 0;
const constants_1 = require("../../../shared/constants/constants");
const zod_1 = __importDefault(require("zod"));
exports.DIFFICULTY_ENUM = ['Easy', 'Moderate', 'Challenging', 'Extreme'];
const basePackageBackendSchema = zod_1.default.object({
    status: zod_1.default.nativeEnum(constants_1.PACKAGE_STATUS),
});
exports.packageImageSchema = zod_1.default.object({
    key: zod_1.default.string(), // Present for existing images (S3 Key)
    file: zod_1.default.instanceof(File).optional(),
    status: zod_1.default.enum(['PENDING_UPLOAD', 'UPLOADED', 'REMOVED']),
});
const draftActivitySchema = zod_1.default.object({
    startTime: zod_1.default.string().optional(),
    endTime: zod_1.default.string().optional(),
    title: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    location: zod_1.default.string().optional(),
    specials: zod_1.default.array(zod_1.default.string()).transform((arr) => arr.filter((s) => s.trim() !== '')),
    included: zod_1.default.boolean().optional(),
});
const draftItineraryDaySchema = zod_1.default.object({
    title: zod_1.default.string().optional(),
    dayNumber: zod_1.default.number().optional(),
    activities: zod_1.default.array(draftActivitySchema).optional(),
});
const draftPackageBackendSchema = basePackageBackendSchema.extend({
    title: zod_1.default.string().min(3).optional(),
    location: zod_1.default.string().optional(),
    state: zod_1.default.string().optional(),
    usp: zod_1.default.string().optional(),
    description: zod_1.default.string().optional(),
    images: zod_1.default.array(exports.packageImageSchema).optional(),
    itinerary: zod_1.default.array(draftItineraryDaySchema).optional(),
    categoryId: zod_1.default.string().optional(),
    difficultyLevel: zod_1.default.enum(exports.DIFFICULTY_ENUM).optional(),
    days: zod_1.default.string().optional(),
    nights: zod_1.default.string().optional(),
    basePrice: zod_1.default.string().optional(),
    inclusions: zod_1.default.array(zod_1.default.string()).optional(),
    exclusions: zod_1.default.array(zod_1.default.string()).optional(),
    packingList: zod_1.default.array(zod_1.default.string()).optional(),
    cancellationPolicy: zod_1.default
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid cancellation policy')
        .optional(),
    isActive: zod_1.default.boolean().optional(),
    status: zod_1.default.literal(constants_1.PACKAGE_STATUS.DRAFT),
});
exports.packageResponseSchema = draftPackageBackendSchema.extend({
    packageId: zod_1.default.string(),
    vendorId: zod_1.default.string(),
});
//============ publish schema=====================
const createActivitySchema = zod_1.default.object({
    startTime: zod_1.default.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
    endTime: zod_1.default.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
    title: zod_1.default.string().min(2, 'Activity title is required'),
    description: zod_1.default
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be at most 1000 characters'),
    location: zod_1.default.string().min(3, 'Activity location is required'),
    specials: zod_1.default.array(zod_1.default.string().min(1, 'Special cannot be empty')),
    included: zod_1.default.boolean(),
});
exports.createItinerarySchema = zod_1.default.object({
    dayNumber: zod_1.default.number().int().min(1),
    title: zod_1.default.string().min(2, 'Day title is required'),
    activities: zod_1.default.array(createActivitySchema).min(1, 'Each day must have at least one activity'),
});
exports.publishPackageBackendSchema = basePackageBackendSchema
    .extend({
    title: zod_1.default
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters'),
    location: zod_1.default
        .string()
        .min(3, 'Location must be at least 2 characters')
        .max(100, 'Location must be at most 100 characters'),
    state: zod_1.default
        .string()
        .min(3, 'State must be at least 2 characters')
        .max(100, 'State must be at most 100 characters'),
    usp: zod_1.default
        .string()
        .min(2, 'USP must be at least 2 characters')
        .max(100, 'USP must be at most 100 characters'),
    categoryId: zod_1.default.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category'),
    difficultyLevel: zod_1.default.enum(exports.DIFFICULTY_ENUM, {
        errorMap: () => ({ message: 'Please select a valid difficulty level' }),
    }),
    description: zod_1.default
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be at most 1000 characters'),
    days: zod_1.default
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, 'Days must be at least 1'),
    nights: zod_1.default.string().min(1, 'Nights is required'),
    basePrice: zod_1.default
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Give a valid price'),
    images: zod_1.default
        .array(exports.packageImageSchema)
        .min(4, 'Minimum 4 images required')
        .max(20, 'Maximum 20 images allowed'),
    itinerary: zod_1.default.array(exports.createItinerarySchema).min(1, 'At least one itinerary day is required'),
    inclusions: zod_1.default.array(zod_1.default.string().min(1)),
    exclusions: zod_1.default.array(zod_1.default.string().min(1)),
    packingList: zod_1.default.array(zod_1.default.string()),
    cancellationPolicy: zod_1.default.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cancellation policy'),
    isActive: zod_1.default.boolean(),
    status: zod_1.default.literal(constants_1.PACKAGE_STATUS.PUBLISHED),
})
    .strict();
exports.PackageCreateUnionSchema = zod_1.default
    .object({
    body: zod_1.default.discriminatedUnion('status', [draftPackageBackendSchema, exports.publishPackageBackendSchema]),
})
    .superRefine((data, ctx) => {
    const body = data.body;
    if (body.status !== constants_1.PACKAGE_STATUS.PUBLISHED)
        return;
    if (Number(body.days) !== body.itinerary.length) {
        ctx.addIssue({
            path: ['body', 'days'],
            message: 'Days must match itinerary length',
            code: zod_1.default.ZodIssueCode.custom,
        });
    }
    if (Number(body.nights) !== Math.max(Number(body.days) - 1, 0)) {
        ctx.addIssue({
            path: ['body', 'nights'],
            message: 'Nights should be days minus one',
            code: zod_1.default.ZodIssueCode.custom,
        });
    }
});
