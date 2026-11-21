'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { resetPasswordAction, type ResetState } from '@/server/actions/password-reset';

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(resetPasswordAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <Field label="New password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>

      <Field label="Confirm new password" htmlFor="confirmPassword">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Saving…' : 'Set new password'}
      </Button>

      <p className="text-center text-xs text-ink-500">
        Setting a new password signs you out everywhere.{' '}
        <Link href="/forgot-password" className="font-medium text-brand-700 hover:underline">
          Need a new link?
        </Link>
      </p>
    </form>
  );
}
