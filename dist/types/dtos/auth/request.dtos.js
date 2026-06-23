"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordRequestSchema = exports.changePasswordSchema = exports.VerifyOtpSchema = exports.VerifyOtpSchemaBody = exports.ForgotPasswordSchema = exports.ForgotPasswordSchemaBody = exports.GoogleAuthRequestSchema = exports.GoogleAuthSchema = exports.ResendOtpSchema = exports.VerifyEmailRequestSchema = exports.VerifyEmailSchema = exports.LoginRequestSchema = exports.LoginSchema = exports.SignupRequestSchema = exports.SignupSchema = void 0;
const zod_1 = require("zod");
exports.SignupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string(),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    role: zod_1.z.enum(['admin', 'user', 'vendor']),
});
exports.SignupRequestSchema = zod_1.z.object({
    body: exports.SignupSchema,
});
//=========
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    // role: z.enum(["admin", "user", "vendor"])
});
exports.LoginRequestSchema = zod_1.z.object({
    body: exports.LoginSchema,
});
//==========
exports.VerifyEmailSchema = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
    otp: zod_1.z
        .string()
        .min(6, 'OTP must be 6 digits')
        .max(6, 'OTP must be 6 digits')
        .nonempty('OTP is required'),
});
exports.VerifyEmailRequestSchema = zod_1.z.object({
    body: exports.VerifyEmailSchema,
});
//=========
exports.ResendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
    }),
});
//======
exports.GoogleAuthSchema = zod_1.z.object({
    token: zod_1.z.string().nonempty('Token is required'),
    clientId: zod_1.z.string().nonempty('Client id is required'),
});
exports.GoogleAuthRequestSchema = zod_1.z.object({
    body: exports.GoogleAuthSchema,
});
exports.ForgotPasswordSchemaBody = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
});
exports.ForgotPasswordSchema = zod_1.z.object({
    body: exports.ForgotPasswordSchemaBody,
});
exports.VerifyOtpSchemaBody = zod_1.z.object({
    email: zod_1.z.string().min(1, 'Email is required').email('Invalid email format'),
    otp: zod_1.z
        .string()
        .min(6, 'OTP must be 6 digits')
        .max(6, 'OTP must be 6 digits')
        .nonempty('OTP is required'),
});
exports.VerifyOtpSchema = zod_1.z.object({
    body: exports.VerifyOtpSchemaBody,
});
exports.changePasswordSchema = zod_1.z.object({
    email: zod_1.z.string().nonempty('Email is required').email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
});
exports.ChangePasswordRequestSchema = zod_1.z.object({
    body: exports.changePasswordSchema,
});
// src/modules/auth/dtos/index.ts
// export * from "./login.dto";
// export * from "./signup.dto";
// export * from "./forgot-password.dto";
// export * from "./verify-email.dto";
// export * from "./resend-otp.dto";
// export * from "./refresh-token.dto";
// import { LoginRequestDTO, SignupResponseDTO } from "../dtos";
// src/modules/auth/dtos/signup.dto.ts
