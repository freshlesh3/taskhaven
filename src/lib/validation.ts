import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer');

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Tell us your name').max(80),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(['FREELANCER', 'CLIENT']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120).optional().or(z.literal('')),
  bio: z.string().trim().max(4000).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional().or(z.literal('')),
  hourlyRate: z.number().int().min(0).max(100_000_00).optional().nullable(),
  isAvailable: z.boolean().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

export const jobSchema = z
  .object({
    title: z.string().trim().min(8, 'Write a clearer title').max(120),
    description: z.string().trim().min(40, 'Describe the work in at least 40 characters').max(20000),
    category: z.string().trim().min(2).max(60),
    budgetType: z.enum(['FIXED', 'HOURLY']),
    budgetMin: z.number().int().min(0).max(10_000_000_00).nullable().optional(),
    budgetMax: z.number().int().min(0).max(10_000_000_00).nullable().optional(),
    experience: z.enum(['ENTRY', 'INTERMEDIATE', 'EXPERT']),
    duration: z.string().trim().max(60).optional().or(z.literal('')),
    skills: z.array(z.string().trim().min(1).max(40)).max(15).optional(),
  })
  .refine(
    (value) =>
      value.budgetMin === null ||
      value.budgetMin === undefined ||
      value.budgetMax === null ||
      value.budgetMax === undefined ||
      value.budgetMax >= value.budgetMin,
    { message: 'The maximum budget must be at least the minimum', path: ['budgetMax'] },
  );

export const proposalSchema = z.object({
  jobId: z.string().min(1),
  coverLetter: z.string().trim().min(40, 'Write at least a couple of sentences').max(8000),
  bidAmount: z.number().int().min(100, 'Bid at least $1'),
  deliveryDays: z.number().int().min(1).max(365),
});

export const messageSchema = z.object({
  contractId: z.string().min(1),
  body: z.string().trim().min(1).max(4000),
});

export const milestoneSchema = z.object({
  contractId: z.string().min(1),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  amount: z.number().int().min(100),
});

export const reviewSchema = z.object({
  contractId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().or(z.literal('')),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type JobInput = z.infer<typeof jobSchema>;
