import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["admin", "user", "vendor"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  // role: z.enum(["admin", "user", "vendor"])
});