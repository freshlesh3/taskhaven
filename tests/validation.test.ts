import { describe, expect, it } from 'vitest';
import { jobSchema, loginSchema, proposalSchema, signupSchema } from '@/lib/validation';

const validJob = {
  title: 'Build a booking flow for a Next.js app',
  description: 'We need a booking flow with availability, payments and confirmation emails for a small studio.',
  category: 'dev-it',
  budgetType: 'FIXED' as const,
  budgetMin: 100000,
  budgetMax: 250000,
  experience: 'INTERMEDIATE' as const,
  duration: '2 weeks',
  skills: ['Next.js', 'Stripe'],
};

describe('signupSchema', () => {
  it('accepts a normal signup', () => {
    const result = signupSchema.safeParse({
      name: 'Ada Lovelace',
      email: '  Ada@Example.com ',
      password: 'correct horse battery',
      role: 'FREELANCER',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('ada@example.com');
  });

  it('rejects a short password', () => {
    const result = signupSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'short',
      role: 'FREELANCER',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown role', () => {
    const result = signupSchema.safeParse({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'longenoughpassword',
      role: 'ADMIN',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('lowercases the email', () => {
    const result = loginSchema.safeParse({ email: 'MARA@Taskhaven.dev', password: 'x' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('mara@taskhaven.dev');
  });
});

describe('jobSchema', () => {
  it('accepts a complete job', () => {
    expect(jobSchema.safeParse(validJob).success).toBe(true);
  });

  it('rejects a title that is too short', () => {
    expect(jobSchema.safeParse({ ...validJob, title: 'Fix' }).success).toBe(false);
  });

  it('rejects a description that is too short', () => {
    expect(jobSchema.safeParse({ ...validJob, description: 'help' }).success).toBe(false);
  });

  it('requires the maximum budget to cover the minimum', () => {
    const result = jobSchema.safeParse({ ...validJob, budgetMin: 200000, budgetMax: 100000 });
    expect(result.success).toBe(false);
  });

  it('allows a missing budget', () => {
    const result = jobSchema.safeParse({ ...validJob, budgetMin: null, budgetMax: null });
    expect(result.success).toBe(true);
  });
});

describe('proposalSchema', () => {
  it('accepts a real proposal', () => {
    const result = proposalSchema.safeParse({
      jobId: 'job_1',
      coverLetter: 'I have shipped three of these and would start with the data model.',
      bidAmount: 250000,
      deliveryDays: 21,
    });
    expect(result.success).toBe(true);
  });

  it('rejects a bid below one dollar', () => {
    const result = proposalSchema.safeParse({
      jobId: 'job_1',
      coverLetter: 'A perfectly reasonable cover letter that is long enough.',
      bidAmount: 0,
      deliveryDays: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a zero-day delivery', () => {
    const result = proposalSchema.safeParse({
      jobId: 'job_1',
      coverLetter: 'A perfectly reasonable cover letter that is long enough.',
      bidAmount: 1000,
      deliveryDays: 0,
    });
    expect(result.success).toBe(false);
  });
});
