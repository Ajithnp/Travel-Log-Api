import { z } from 'zod';

const HHmm = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format (e.g. 05:00)');

const requiredPrice = (label: string) =>
  z
    .number({
      required_error: `${label} is required`,
      invalid_type_error: `${label} must be a number`,
    })
    .positive(`${label} must be greater than 0`);

const optionalPrice = (label: string) =>
  z
    .number({
      invalid_type_error: `${label} must be a number`,
    })
    .positive(`${label} must be greater than 0`)
    .optional();

export const createScheduleBodySchema = z
  .object({
    startDate: z
      .string({ required_error: 'Start date is required' })
      .datetime({ message: 'Invalid start date format' }),
    endDate: z
      .string({ required_error: 'End date is required' })
      .datetime({ message: 'Invalid end date format' }),
    reportingTime: HHmm,
    reportingLocation: z
      .string({ required_error: 'Reporting location is required' })
      .trim()
      .min(5, 'Reporting location must be at least 5 characters')
      .max(300, 'Reporting location cannot exceed 300 characters'),

    pricing: z.object({
      solo: requiredPrice('Solo price'),
      duo: optionalPrice('Duo price'),
      group: optionalPrice('Group price'),
    }),
    totalSeats: z
      .number({
        required_error: 'Total seats is required',
        invalid_type_error: 'Total seats must be a number',
      })
      .int('Total seats must be an integer')
      .min(1, 'Must have at least 1 seat')
      .max(500, 'Seats cannot exceed 500'),

    notes: z
      .string()
      .trim()
      .min(5, 'notes must be at least 5 characters')
      .max(300, 'notescannot exceed 300 characters')
      .optional(),
  })
  .refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const createScheduleSchema = z.object({
  params: z.object({ packageId: z.string() }),
  body: createScheduleBodySchema,
});
