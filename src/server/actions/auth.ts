'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession, getCurrentUser, requireUser } from '@/lib/auth';
import { loginSchema, signupSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { clientKey } from '@/lib/request';
import { formatRetryAfter, rateLimit } from '@/lib/rate-limit';
import { consumeVerificationToken, createVerificationToken } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';

export type AuthState = { error?: string; fieldErrors?: Record<string, string> } | null;

const SIGNUP_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const LOGIN_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 };
const RESEND_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };

async function uniqueHandle(base: string): Promise<string> {
  const root = slugify(base) || 'member';
  let handle = root;
  let suffix = 1;
  while (await db.user.findUnique({ where: { handle } })) {
    suffix += 1;
    handle = `${root}-${suffix}`;
  }
  return handle;
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const gate = rateLimit(await clientKey('signup'), SIGNUP_LIMIT.max, SIGNUP_LIMIT.windowMs);
  if (!gate.allowed) {
    return { error: `Too many signups from this address. Try again in ${formatRetryAfter(gate.retryAfterMs)}.` };
  }

  const raw = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
    role: String(formData.get('role') ?? 'FREELANCER'),
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? 'form')] = issue.message;
    }
    return { fieldErrors, error: 'Check the highlighted fields.' };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { fieldErrors: { email: 'That email already has an account' } };

  const handle = await uniqueHandle(parsed.data.name);
  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      handle,
      role: parsed.data.role,
      headline: parsed.data.role === 'CLIENT' ? 'Hiring on Taskhaven' : 'Independent specialist',
    },
  });

  const token = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);

  await createSession(user.id);
  redirect('/verify-notice');
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: String(formData.get('email') ?? ''),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    return { error: 'Enter your email and password.' };
  }

  const gate = rateLimit(
    await clientKey(`login:${parsed.data.email}`),
    LOGIN_LIMIT.max,
    LOGIN_LIMIT.windowMs,
  );
  if (!gate.allowed) {
    return { error: `Too many attempts. Try again in ${formatRetryAfter(gate.retryAfterMs)}.` };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: 'That email and password do not match.' };
  }

  if (user.isSuspended) {
    return { error: 'This account is suspended. Contact the site operator.' };
  }

  await createSession(user.id);

  const next = String(formData.get('next') ?? '');
  redirect(next.startsWith('/') ? next : '/dashboard');
}

export async function resendVerificationAction(): Promise<void> {
  const user = await requireUser('/verify-notice');
  if (user.emailVerifiedAt) redirect('/dashboard');

  const gate = rateLimit(`resend:${user.id}`, RESEND_LIMIT.max, RESEND_LIMIT.windowMs);
  if (!gate.allowed) redirect('/verify-notice?error=rate-limited');

  const token = await createVerificationToken(user.id);
  await sendVerificationEmail(user.email, token);
  redirect('/verify-notice?sent=1');
}

export async function confirmEmailAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');
  if (!token) redirect('/verify-notice?error=invalid');

  const result = await consumeVerificationToken(token);
  if (!result.ok) {
    redirect(`/verify-notice?error=${result.reason}`);
  }

  await db.notification.create({
    data: {
      userId: result.userId,
      kind: 'ACCOUNT',
      body: 'Your email address is confirmed.',
      href: '/dashboard',
    },
  });

  redirect('/dashboard?verified=1');
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/');
}

export async function demoLoginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '');
  const user = await db.user.findUnique({ where: { email } });
  if (!user) redirect('/login?error=demo-missing');
  if (user.isSuspended) redirect('/login?error=suspended');
  await createSession(user.id);
  redirect('/dashboard');
}

export async function currentUserOrNull() {
  return getCurrentUser();
}
