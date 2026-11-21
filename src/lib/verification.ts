import { createHash, randomBytes } from 'node:crypto';
import { db } from './db';

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Creates a single-use verification token and returns the raw value to email. */
export async function createVerificationToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url');

  // One live token per user keeps the table tidy and invalidates old links.
  await db.verificationToken.deleteMany({ where: { userId, usedAt: null } });
  await db.verificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      purpose: 'EMAIL_VERIFICATION',
      expiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
    },
  });

  return token;
}

export type ConsumeResult =
  | { ok: true; userId: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'used' };

export async function consumeVerificationToken(token: string): Promise<ConsumeResult> {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record) return { ok: false, reason: 'invalid' };
  if (record.usedAt) return { ok: false, reason: 'used' };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: 'expired' };

  await db.$transaction([
    db.verificationToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
  ]);

  return { ok: true, userId: record.userId };
}
