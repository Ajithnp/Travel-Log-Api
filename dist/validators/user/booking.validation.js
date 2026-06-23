"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelBookingRequestSchema = exports.cancelBookingSchema = exports.InitiateBookingRequestSchema = exports.initiateBookingSchema = exports.travelerSchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
exports.objectIdSchema = zod_1.z
    .string({
    required_error: 'Field is required',
    invalid_type_error: 'Must be a string',
})
    .regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId format');
exports.travelerSchema = zod_1.z.object({
    fullName: zod_1.z
        .string({
        required_error: 'fullName is required',
    })
        .trim()
        .min(2, 'fullName must be at least 2 characters')
        .max(100, 'fullName must not exceed 100 characters'),
    idType: zod_1.z
        .string({
        required_error: 'idType is required',
    })
        .trim()
        .min(2, 'idType is required')
        .max(50, 'idType is too long'),
    idNumber: zod_1.z
        .string({
        required_error: 'idNumber is required',
    })
        .trim()
        .min(3, 'idNumber is required')
        .max(50, 'idNumber is too long'),
    isLead: zod_1.z.boolean({
        required_error: 'isLead is required',
    }),
    phoneNumber: zod_1.z
        .string()
        .trim()
        .min(7, 'Invalid phoneNumber')
        .max(20, 'Invalid phoneNumber')
        .optional(),
    emailAddress: zod_1.z.string().email('Valid email required').optional().or(zod_1.z.literal('')),
    emergencyContact: zod_1.z.string().optional(),
    relation: zod_1.z
        .string()
        .trim()
        .min(2, 'relation is too short')
        .max(50, 'relation is too long')
        .optional(),
});
exports.initiateBookingSchema = zod_1.z
    .object({
    packageId: exports.objectIdSchema.refine(Boolean, {
        message: 'packageId is required',
    }),
    scheduleId: exports.objectIdSchema.refine(Boolean, {
        message: 'scheduleId is required',
    }),
    tierType: zod_1.z.enum(['SOLO', 'DUO', 'GROUP'], {
        required_error: 'tierType is required',
        invalid_type_error: 'tierType must be SOLO, DUO, or GROUP',
    }),
    seatsCount: zod_1.z
        .number({
        required_error: 'seatsCount is required',
        invalid_type_error: 'seatsCount must be a number',
    })
        .int('seatsCount must be an integer')
        .min(1, 'Minimum seatsCount is 1')
        .max(20, 'Maximum seatsCount exceeded'),
    useWallet: zod_1.z.boolean().default(false).optional(),
    travelers: zod_1.z
        .array(exports.travelerSchema, {
        required_error: 'travelers is required',
    })
        .min(1, 'At least one traveler is required'),
    amountInPaise: zod_1.z
        .number({
        required_error: 'amountInPaise is required',
        invalid_type_error: 'amountInPaise must be a number',
    })
        .int('amountInPaise must be an integer')
        .positive('amountInPaise must be greater than 0'),
    offerId: exports.objectIdSchema
        .refine(Boolean, {
        message: 'offerId is required',
    })
        .optional(),
    offerDiscount: zod_1.z.number().optional(),
})
    .superRefine((data, ctx) => {
    if (data.seatsCount !== data.travelers.length) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['travelers'],
            message: 'travelers count must match seatsCount',
        });
    }
    const leadCount = data.travelers.filter((t) => t.isLead).length;
    if (leadCount !== 1) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['travelers'],
            message: 'Exactly one lead traveler is required',
        });
    }
    data.travelers.forEach((traveler, index) => {
        if (traveler.isLead) {
            if (!traveler.phoneNumber) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['travelers', index, 'phoneNumber'],
                    message: 'Lead traveler phoneNumber is required',
                });
            }
            if (!traveler.emailAddress) {
                ctx.addIssue({
                    code: zod_1.z.ZodIssueCode.custom,
                    path: ['travelers', index, 'emailAddress'],
                    message: 'Lead traveler emailAddress is required',
                });
            }
        }
    });
    if (data.tierType === 'SOLO' && data.seatsCount !== 1) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['seatsCount'],
            message: 'SOLO booking must have 1 seat',
        });
    }
    if (data.tierType === 'DUO' && data.seatsCount !== 2) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['seatsCount'],
            message: 'DUO booking must have 2 seats',
        });
    }
    if (data.tierType === 'GROUP' && data.seatsCount !== 4) {
        ctx.addIssue({
            code: zod_1.z.ZodIssueCode.custom,
            path: ['seatsCount'],
            message: 'GROUP booking must have 4 seats',
        });
    }
});
exports.InitiateBookingRequestSchema = zod_1.z.object({
    body: exports.initiateBookingSchema,
});
// Cancel booking validation
exports.cancelBookingSchema = zod_1.z.object({
    reason: zod_1.z
        .string({
        required_error: 'Cancellation reason is required',
    })
        .trim()
        .min(3, 'Reason must be at least 3 characters')
        .max(200, 'Reason must not exceed 200 characters'),
    details: zod_1.z.string().trim().max(500, 'Details must not exceed 500 characters').optional(),
});
exports.CancelBookingRequestSchema = zod_1.z.object({
    body: exports.cancelBookingSchema,
    params: zod_1.z.object({
        bookingId: exports.objectIdSchema,
    }),
});
