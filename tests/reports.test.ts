import { describe, expect, it } from 'vitest';
import { reportSchema, reviewSchema } from '@/lib/validation';

describe('reportSchema', () => {
  it('accepts a job report with details', () => {
    const result = reportSchema.safeParse({
      targetType: 'JOB',
      targetId: 'job_123',
      reason: 'OFF_PLATFORM',
      details: 'They asked me to move to email and pay by transfer.',
    });
    expect(result.success).toBe(true);
  });

  it('accepts a profile report without details', () => {
    expect(
      reportSchema.safeParse({ targetType: 'USER', targetId: 'user_1', reason: 'SPAM', details: '' }).success,
    ).toBe(true);
  });

  it('rejects an unknown reason', () => {
    expect(
      reportSchema.safeParse({ targetType: 'JOB', targetId: 'job_1', reason: 'DISLIKE', details: '' }).success,
    ).toBe(false);
  });

  it('rejects an unknown target type', () => {
    expect(
      reportSchema.safeParse({ targetType: 'CONTRACT', targetId: 'c_1', reason: 'SPAM', details: '' }).success,
    ).toBe(false);
  });

  it('rejects details over 1000 characters', () => {
    expect(
      reportSchema.safeParse({
        targetType: 'JOB',
        targetId: 'job_1',
        reason: 'OTHER',
        details: 'x'.repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe('reviewSchema', () => {
  it('accepts 1 to 5 stars', () => {
    expect(reviewSchema.safeParse({ contractId: 'c_1', rating: 5, comment: 'Great' }).success).toBe(true);
    expect(reviewSchema.safeParse({ contractId: 'c_1', rating: 1, comment: '' }).success).toBe(true);
  });

  it('rejects zero and six stars', () => {
    expect(reviewSchema.safeParse({ contractId: 'c_1', rating: 0, comment: '' }).success).toBe(false);
    expect(reviewSchema.safeParse({ contractId: 'c_1', rating: 6, comment: '' }).success).toBe(false);
  });
});
