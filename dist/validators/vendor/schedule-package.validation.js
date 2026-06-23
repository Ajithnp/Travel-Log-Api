"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleStatusSchema = exports.createScheduleSchema = exports.createScheduleBodySchema = exports.MIN_TRIP_DAYS = void 0;
const constants_1 = require("../../shared/constants/constants");
const zod_1 = require("zod");
exports.MIN_TRIP_DAYS = 10;
const toDateOnly = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
};
const tomorrow = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
};
const HHmm = zod_1.z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format (e.g. 05:00)');
const requiredPrice = (label) => zod_1.z
    .number({
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be a number`,
})
    .positive(`${label} must be greater than 0`);
const optionalPrice = (label) => zod_1.z
    .number({
    invalid_type_error: `${label} must be a number`,
})
    .positive(`${label} must be greater than 0`)
    .optional();
exports.createScheduleBodySchema = zod_1.z
    .object({
    startDate: zod_1.z
        .string({ required_error: 'Start date is required' })
        .min(1, 'Start date is required')
        .refine((val) => toDateOnly(val) >= tomorrow(), 'Start date must be at least 1 day in the future')
        .refine((val) => {
        if (!val)
            return true;
        const minStart = new Date();
        minStart.setHours(0, 0, 0, 0);
        minStart.setDate(minStart.getDate() + exports.MIN_TRIP_DAYS);
        return toDateOnly(val) >= minStart;
    }, `Schedule must be created at least ${exports.MIN_TRIP_DAYS} days in advance for better organization`),
    endDate: zod_1.z
        .string({ required_error: 'End date is required' })
        .datetime({ message: 'Invalid end date format' }),
    reportingTime: HHmm,
    reportingLocation: zod_1.z
        .string({ required_error: 'Reporting location is required' })
        .trim()
        .min(5, 'Reporting location must be at least 5 characters')
        .max(300, 'Reporting location cannot exceed 300 characters'),
    pricing: zod_1.z.object({
        solo: requiredPrice('Solo price'),
        duo: optionalPrice('Duo price'),
        group: optionalPrice('Group price'),
    }),
    totalSeats: zod_1.z
        .number({
        required_error: 'Total seats is required',
        invalid_type_error: 'Total seats must be a number',
    })
        .int('Total seats must be an integer')
        .min(1, 'Must have at least 1 seat')
        .max(500, 'Seats cannot exceed 500'),
    notes: zod_1.z
        .string()
        .trim()
        .min(5, 'notes must be at least 5 characters')
        .max(300, 'notescannot exceed 300 characters')
        .optional(),
})
    .refine(({ startDate, endDate }) => !startDate || !endDate || toDateOnly(endDate) >= toDateOnly(startDate), {
    message: 'End date cannot be before start date',
    path: ['endDate'],
})
    .refine(({ pricing }) => !pricing.duo || pricing.duo <= pricing.solo * 2, {
    message: 'Duo price should not exceed 2× the solo price',
    path: ['pricing', 'duo'],
})
    .refine(({ pricing }) => !pricing.group || pricing.group <= pricing.solo * 4, {
    message: 'Group price should not exceed 4× the solo price',
    path: ['pricing', 'group'],
});
exports.createScheduleSchema = zod_1.z.object({
    params: zod_1.z.object({ packageId: zod_1.z.string() }),
    body: exports.createScheduleBodySchema,
});
exports.updateScheduleStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum([constants_1.SCHEDULE_STATUS.ONGOING, constants_1.SCHEDULE_STATUS.COMPLETED]),
    }),
    params: zod_1.z.object({ scheduleId: zod_1.z.string() }),
});
