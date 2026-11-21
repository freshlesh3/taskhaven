/**
 * A small fixed-window rate limiter.
 *
 * This is deliberately in-process: it protects a single Node instance from
 * credential stuffing and signup floods without adding infrastructure. If you
 * run several instances, back it with Redis — the call sites only need a
 * `RateLimitResult`.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

function sweep(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): RateLimitResult {
  if (limit <= 0) return { allowed: false, remaining: 0, retryAfterMs: windowMs };

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    sweep(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, bucket.resetAt - now) };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

/** Test helper: clears every bucket. */
export function resetRateLimits() {
  buckets.clear();
}

export function formatRetryAfter(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  if (minutes <= 1) return 'a minute';
  return `${minutes} minutes`;
}
