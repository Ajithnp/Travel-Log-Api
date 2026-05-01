import { z } from 'zod';

export const CancellationRuleSchema = z.object({
  daysBeforeTrip: z
    .number({ required_error: 'daysBeforeTrip is required' })
    .int('daysBeforeTrip must be an integer')
    .min(0, 'daysBeforeTrip cannot be negative'),
  refundPercent: z
    .number({ required_error: 'refundPercent is required' })
    .min(0, 'refundPercent must be at least 0')
    .max(100, 'refundPercent cannot exceed 100'),
});

export const CreateCancellationPolicySchema = z.object({
  key: z
    .string({ required_error: 'key is required' })
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/, 'key must be lowercase letters, numbers, or underscores'),
  label: z.string({ required_error: 'label is required' }).min(1, 'label cannot be empty').max(100),
  description: z.string().max(500).optional(),
  rules: z
    .array(CancellationRuleSchema)
    .min(1, 'At least one rule is required')
    .max(10, 'Maximum 10 rules allowed')
    .refine(
      (rules) => {
        const days = rules.map((r) => r.daysBeforeTrip);
        return new Set(days).size === days.length;
      },
      { message: 'Each rule must have a unique daysBeforeTrip value' },
    ),
});

export const CancellationPolicyRequestSchema = z.object({
  body: CreateCancellationPolicySchema,
});

export const UpdateCancellationPolicySchema = z
  .object({
    label: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    rules: z
      .array(CancellationRuleSchema)
      .min(1, 'At least one rule is required')
      .max(10)
      .refine(
        (rules) => {
          const days = rules.map((r) => r.daysBeforeTrip);
          return new Set(days).size === days.length;
        },
        { message: 'Each rule must have a unique daysBeforeTrip value' },
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const PolicyStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required' }),
});

export const PolicyStatusRequestSchema = z.object({
  body: PolicyStatusSchema,
});

export type CreateCancellationPolicyDto = z.infer<typeof CreateCancellationPolicySchema>;
export type UpdateCancellationPolicyDto = z.infer<typeof UpdateCancellationPolicySchema>;
export type CancellationRuleDto = z.infer<typeof CancellationRuleSchema>;
export type StatusToggleDto = z.infer<typeof PolicyStatusSchema>;

// response DTOs

export interface CancellationRuleResponseDto {
  daysBeforeTrip: number;
  refundPercent: number;
}

export interface CancellationPolicyResponseDto {
  id: string;
  key: string;
  label: string;
  description?: string;
  rules: CancellationRuleResponseDto[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPoliciesResponseDto {
  data: CancellationPolicyResponseDto[];
  total: number;
}
