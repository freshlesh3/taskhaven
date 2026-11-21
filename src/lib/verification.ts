import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;

export type TokenPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Creates a single-use token and returns the raw value to email. */
export async function createToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const token = randomBytes(32).toString('base64url');
  const ttl = purpose === 'PASSWORD_RESET' ? RESET_TTL_MS : VERIFICATION_TTL_MS;

  // One live token per purpose keeps the table tidy and invalidates old links.
  await db.verificationToken.deleteMany({ where: { userId, purpose, usedAt: null } });
  await db.verificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      purpose,
      expiresAt: new Date(Date.now() + ttl),
    },
  });

  return token;
}

/** Back-compat helper used by the signup flow. */
export function createVerificationToken(userId: string): Promise<string> {
  return createToken(userId, 'EMAIL_VERIFICATION');
}

export type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'used' | 'wrong-purpose' };

/**
 * Validates and burns a token. Does not change the user — callers decide what the
 * token grants (verifying an address vs setting a new password).
 */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<ConsumeResult> {
  const record = await db.verificationToken.findUnique({ where: { tokenHash: hashToken(token) } });

  if (!record) return { ok: false, reason: 'invalid' };
  if (record.purpose !== purpose) return { ok: false, reason: 'wrong-purpose' };
  if (record.usedAt) return { ok: false, reason: 'used' };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };

  await db.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true, userId: record.userId };
}

/** Validates a link, burns it and marks the address verified. */
export async function consumeVerificationToken(token: string): Promise<ConsumeResult> {
  const result = await consumeToken(token, 'EMAIL_VERIFICATION');
  if (!result.ok) return result;

  await db.user.update({ where: { id: result.userId }, data: { emailVerifiedAt: new Date() } });
  return result;
}
