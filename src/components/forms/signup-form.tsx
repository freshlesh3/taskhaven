'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { signupAction, type AuthState } from '@/server/actions/auth';

const roles = [
  { value: 'FREELANCER', title: 'I want to work', body: 'Build a profile, send proposals, get paid per milestone.' },
  { value: 'CLIENT', title: 'I want to hire', body: 'Post jobs, compare proposals, run contracts in one place.' },
] as const;

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signupAction, null);
  const [role, setRole] = useState<string>('FREELANCER');

  return (
    <form action={formAction} className="space-y-5">
      <fieldset>
        <legend className="sr-only">I want to</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map((option) => (
            <label
              key={option.value}
              className={
                role === option.value
                  ? 'cursor-pointer rounded-xl border-2 border-brand-600 bg-brand-50 p-4'
                  : 'cursor-pointer rounded-xl border border-ink-100 p-4 hover:border-ink-300'
              }
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="sr-only"
              />
              <span className="block text-sm font-semibold text-ink-950">{option.title}</span>
              <span className="mt-1 block text-xs leading-5 text-ink-500">{option.body}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Full name" htmlFor="name" error={state?.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" required placeholder="Ada Lovelace" />
      </Field>

      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        error={state?.fieldErrors?.password}
        hint="At least 8 characters."
      >
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>

      <p className="text-center text-xs leading-5 text-ink-500">
        By joining you agree to the{' '}
        <Link href="/terms" className="underline">
          terms
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline">
          privacy policy
        </Link>
        . Payments in this build are simulated.
      </p>
    </form>
  );
}
