import { z } from 'zod'

// ---------------- LOGIN ----------------
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(64, 'Password too long'),

  rememberMe: z.boolean().optional(),
})

// ---------------- REGISTER ----------------
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(60, 'Name must be under 60 characters')
      .trim(),

    email: z
      .string()
      .min(1, 'Email is required')
      .max(254, 'Email too long')
      .email('Please enter a valid email address')
      .toLowerCase(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be under 64 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

    confirmPassword: z.string(),

    agreeTerms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ---------------- FORGOT PASSWORD ----------------
export const forgotSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Enter a valid email')
    .toLowerCase(),
})

// ---------------- RESET PASSWORD ----------------
export const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password too long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })


export const profileSchema = z.object({
  // Step 0: Basic Info
  age: z.coerce
    .number()
    .min(18, "Minimum age is 18")
    .max(100, "Please enter a valid age"),

  dependents: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(20, "Please enter a valid number of dependents"),

  incomeMonthly: z.coerce
    .number()
    .min(1000, "Income must be at least ₹1,000")
    .max(100000000, "Please enter a valid income"),

  // Risk Score & Answers (Handled via state in CreateProfile)
  riskScore: z.number().optional(),
  answers: z.array(z.number()).length(4).optional(),
});