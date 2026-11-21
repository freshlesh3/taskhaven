'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/input';
import { updateProfileAction } from '@/server/actions/profile';
import type { FormState } from '@/server/actions/jobs';

type ProfileValues = {
  name: string;
  headline: string;
  bio: string;
  country: string;
  hourlyRate: number | null;
  isAvailable: boolean;
  skills: string;
};

export function ProfileForm({ initial }: { initial: ProfileValues }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateProfileAction, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Name" htmlFor="name">
        <Input id="name" name="name" defaultValue={initial.name} required />
      </Field>

      <Field label="Headline" htmlFor="headline" hint="One line that says what you do.">
        <Input id="headline" name="headline" defaultValue={initial.headline} placeholder="Product designer · SaaS dashboards" />
      </Field>

      <Field label="Bio" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={6} defaultValue={initial.bio} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" htmlFor="country">
          <Input id="country" name="country" defaultValue={initial.country} placeholder="Portugal" />
        </Field>
        <Field label="Hourly rate (cents)" htmlFor="hourlyRate" hint="e.g. 8500 for $85/hr">
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            min={0}
            step={100}
            defaultValue={initial.hourlyRate ?? ''}
          />
        </Field>
      </div>

      <Field label="Skills" htmlFor="skills" hint="Comma separated. These power search and matching.">
        <Input id="skills" name="skills" defaultValue={initial.skills} placeholder="React, TypeScript, Product design" />
      </Field>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="isAvailable" defaultChecked={initial.isAvailable} className="h-4 w-4 rounded border-ink-300" />
        Available for new work
      </label>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}
      {state && !state.error ? <p className="text-sm font-medium text-brand-700">Profile saved.</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  );
}
