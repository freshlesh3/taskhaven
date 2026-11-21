import 'server-only';
import { headers } from 'next/headers';

/**
 * Best-effort client identity for rate limiting.
 *
 * Behind a reverse proxy you must set and trust `x-forwarded-for`; without one it
 * falls back to a constant, which still limits the instance globally. Rate limits
 * are an abuse brake, never an authorization check.
 */
export async function clientKey(scope: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get('x-forwarded-for')?.split(',')[0]?.trim();
  const realIp = headerList.get('x-real-ip')?.trim();
  const ip = forwarded || realIp || 'local';
  return `${scope}:${ip}`;
}
