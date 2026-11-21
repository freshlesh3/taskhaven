'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { loginAction, type AuthState } from '@/server/actions/auth';

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? 'Signing in…' : 'Log in'}
      </Button>

      <p className="text-center text-sm text-ink-500">
        New here?{' '}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
