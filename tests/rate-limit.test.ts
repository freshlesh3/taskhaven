import { beforeEach, describe, expect, it } from 'vitest';
import { formatRetryAfter, rateLimit, resetRateLimits } from '@/lib/rate-limit';

describe('rateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows up to the limit, then blocks', () => {
    const now = 1_000_000;
    expect(rateLimit('k', 3, 60_000, now).allowed).toBe(true);
    expect(rateLimit('k', 3, 60_000, now).allowed).toBe(true);
    expect(rateLimit('k', 3, 60_000, now).allowed).toBe(true);
    const blocked = rateLimit('k', 3, 60_000, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('reports how long to wait', () => {
    const now = 1_000_000;
    rateLimit('k', 1, 30_000, now);
    const blocked = rateLimit('k', 1, 30_000, now + 10_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(20_000);
  });

  it('starts a fresh window after it expires', () => {
    const now = 1_000_000;
    rateLimit('k', 1, 1_000, now);
    expect(rateLimit('k', 1, 1_000, now + 500).allowed).toBe(false);
    expect(rateLimit('k', 1, 1_000, now + 1_001).allowed).toBe(true);
  });

  it('keeps separate keys independent', () => {
    const now = 1_000_000;
    rateLimit('a', 1, 60_000, now);
    expect(rateLimit('b', 1, 60_000, now).allowed).toBe(true);
  });

  it('decrements the remaining count', () => {
    const now = 1_000_000;
    expect(rateLimit('k', 5, 60_000, now).remaining).toBe(4);
    expect(rateLimit('k', 5, 60_000, now).remaining).toBe(3);
  });

  it('refuses a non-positive limit instead of allowing everything', () => {
    expect(rateLimit('k', 0, 60_000).allowed).toBe(false);
  });
});

describe('formatRetryAfter', () => {
  it('speaks in human units', () => {
    expect(formatRetryAfter(5_000)).toBe('a minute');
    expect(formatRetryAfter(120_000)).toBe('2 minutes');
  });
});
