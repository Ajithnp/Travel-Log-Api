import { z } from 'zod';

export const SignupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['admin', 'user', 'vendor']),
});

export const SignupRequestSchema = z.object({
  body: SignupSchema,
});

export type SignupRequestDTO = z.infer<typeof SignupSchema>;
//=========

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  // role: z.enum(["admin", "user", "vendor"])
});

export const LoginRequestSchema = z.object({
  body: LoginSchema,
});
export type LoginRequestDTO = z.infer<typeof LoginSchema>;
//==========

export const VerifyEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .nonempty('OTP is required'),
});

export const VerifyEmailRequestSchema = z.object({
  body: VerifyEmailSchema,
});
export type VerifyEmailRequestDTO = z.infer<typeof VerifyEmailSchema>;
//=========
export const ResendOtpSchema = z.object({
  body: z.object({
      email: z.string().min(1, 'Email is required').email('Invalid email format'),
  })
 
});

//======

export const GoogleAuthSchema = z.object({
  token: z.string().nonempty('Token is required'),
  clientId: z.string().nonempty('Client id is required'),
});

export type GoogleAuthRequestDTO = z.infer<typeof GoogleAuthSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
});

export type ForgotPasswordRequestDTO = z.infer<typeof ForgotPasswordSchema>;

export const VerifyOtpSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .nonempty('OTP is required'),
});

export type VerifyOtpRequestDTO = z.infer<typeof VerifyOtpSchema>;

export const changePasswordSchema = z.object({
  email: z.string().nonempty('Email is required').email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type ChangePasswordRequestDTO = z.infer<typeof changePasswordSchema>;

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
}
//   ├── login.dto.ts
// │       │   ├── signup.dto.ts
// │       │   ├── forgot-password.dto.ts
// │       │   ├── verify-email.dto.ts
// │       │   ├── resend-otp.dto.ts
// │       │   └── refresh-token.dto.ts

export interface SignupResponseDTO {
  email: string;
  role: string;
  otpExpiry: number;
  message: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface VerifyEmailResponseDTO {
  message: string;
  verified: boolean;
}

export interface ResendOtpRequestDTO {
  email: string;
}

export interface ResendOtpResponseDTO {
  message: string;
  otpExpiry: number;
}

export interface ForgotPasswordResponseDTO {
  message: string;
  otpExpiry: number;
}

// src/modules/auth/dtos/index.ts

// export * from "./login.dto";
// export * from "./signup.dto";
// export * from "./forgot-password.dto";
// export * from "./verify-email.dto";
// export * from "./resend-otp.dto";
// export * from "./refresh-token.dto";

// import { LoginRequestDTO, SignupResponseDTO } from "../dtos";

// src/modules/auth/dtos/signup.dto.ts
