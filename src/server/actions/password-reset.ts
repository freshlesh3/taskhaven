'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { clientKey } from '@/lib/request';
import { formatRetryAfter, rateLimit } from '@/lib/rate-limit';
import { consumeToken, createToken } from '@/lib/verification';
import { sendPasswordResetEmail } from '@/lib/email';
import { emailSchema } from '@/lib/validation';

export type ResetState = { sent?: boolean; error?: string } | null;

const REQUEST_LIMIT = { max: 3, windowMs: 15 * 60 * 1000 };

export async function requestPasswordResetAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const gate = rateLimit(await clientKey('reset-request'), REQUEST_LIMIT.max, REQUEST_LIMIT.windowMs);
  if (!gate.allowed) {
    return { error: `Too many requests. Try again in ${formatRetryAfter(gate.retryAfterMs)}.` };
  }

  const parsed = emailSchema.safeParse(String(formData.get('email') ?? ''));
  if (!parsed.success) return { error: 'Enter the email address on your account.' };

  const user = await db.user.findUnique({ where: { email: parsed.data } });

  // Always report success: an unknown address must not be distinguishable.
  if (user && !user.isSuspended) {
    const token = await createToken(user.id, 'PASSWORD_RESET');
    await sendPasswordResetEmail(user.email, token);
  }

  return { sent: true };
}

const FAILURES: Record<string, string> = {
  invalid: 'That reset link is not valid. Request a new one.',
  expired: 'That reset link expired. Request a new one.',
  used: 'That reset link was already used. Request a new one.',
  'wrong-purpose': 'That link is not a password reset link.',
};

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) return { error: 'Use at least 8 characters.' };
  if (password !== confirm) return { error: 'The two passwords do not match.' };

  const result = await consumeToken(token, 'PASSWORD_RESET');
  if (!result.ok) return { error: FAILURES[result.reason] ?? 'That link is not valid.' };

  await db.user.update({
    where: { id: result.userId },
    data: { passwordHash: await hashPassword(password) },
  });
  // A reset ends every existing session.
  await db.session.deleteMany({ where: { userId: result.userId } });

  redirect('/login?reset=1');
}
