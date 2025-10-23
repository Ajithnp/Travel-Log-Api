import { z } from 'zod';

export const UpdateEmailRequestSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export type UpdateEmailRequestDTO = z.infer<typeof UpdateEmailRequestSchema>;

export const UpdateEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .nonempty('OTP is required'),
});

export type VerifyEmailRequestDTO = {
  userId: string;
  refreshToken: string;
  oldEmail: string;
  email: string;
  otp: string;
};

export const ResetPasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Password must be at least 6 characters long'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type ResetPasswordRequestDTO = {
  email: string;
  token: string;
  oldPassword: string;
  newPassword: string;
};

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters long')
    .regex(/^[A-Za-z\s]+$/, 'Name can only contain alphabets and spaces')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be a valid 10-digit number')
    .optional(),
});
//   .refine((data) => Object.keys(data).length > 0, {
//     message: "At least one field must be provided to update",
//   });

export type UpdateProfileRequestDTO = {
  email: string;
  name?: string;
  phone?: string;
};
