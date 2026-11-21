'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { changePasswordAction } from '@/server/actions/profile';
import type { FormState } from '@/server/actions/jobs';

export function PasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(changePasswordAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="Current password" htmlFor="currentPassword">
        <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
          <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Confirm new password" htmlFor="confirmPassword">
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
        </Field>
      </div>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
      {state && !state.error ? (
        <p className="text-sm font-medium text-brand-700">Password changed. Other sessions were signed out.</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Change password'}
      </Button>
    </form>
  );
}
