'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { requestPasswordResetAction, type ResetState } from '@/server/actions/password-reset';

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(requestPasswordResetAction, null);

  if (state?.sent) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-50 p-4 text-sm leading-6 text-brand-900">
          If that address has an account, a reset link is on its way. The link expires in one hour.
        </div>
        <Link href="/login" className="block text-center text-sm font-medium text-brand-700 hover:underline">
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset link'}
      </Button>

      <p className="text-center text-sm text-ink-500">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
