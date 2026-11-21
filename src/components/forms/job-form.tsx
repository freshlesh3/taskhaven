'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/constants';
import { createJobAction, type FormState } from '@/server/actions/jobs';

export function JobForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createJobAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <Field label="Job title" htmlFor="title" error={state?.fieldErrors?.title} hint="A specific title gets better proposals.">
        <Input id="title" name="title" placeholder="Build a booking flow for a Next.js app" required />
      </Field>

      <Field label="Description" htmlFor="description" error={state?.fieldErrors?.description}>
        <Textarea
          id="description"
          name="description"
          rows={10}
          placeholder="What needs building, what already exists, what done looks like, and any constraints."
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category" error={state?.fieldErrors?.category}>
          <Select id="category" name="category" defaultValue={CATEGORIES[0].slug} required>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Experience level" htmlFor="experience">
          <Select id="experience" name="experience" defaultValue="INTERMEDIATE">
            <option value="ENTRY">Entry level</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Budget type" htmlFor="budgetType">
          <Select id="budgetType" name="budgetType" defaultValue="FIXED">
            <option value="FIXED">Fixed price</option>
            <option value="HOURLY">Hourly</option>
          </Select>
        </Field>
        <Field label="Minimum (cents)" htmlFor="budgetMin" hint="e.g. 150000 for $1,500">
          <Input id="budgetMin" name="budgetMin" type="number" min={0} step={100} />
        </Field>
        <Field label="Maximum (cents)" htmlFor="budgetMax" error={state?.fieldErrors?.budgetMax}>
          <Input id="budgetMax" name="budgetMax" type="number" min={0} step={100} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected duration" htmlFor="duration" hint="Optional">
          <Input id="duration" name="duration" placeholder="2–4 weeks" />
        </Field>
        <Field label="Skills" htmlFor="skills" hint="Comma separated, e.g. React, TypeScript, Stripe">
          <Input id="skills" name="skills" placeholder="React, TypeScript, Stripe" />
        </Field>
      </div>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Publishing…' : 'Publish job'}
        </Button>
        <p className="text-xs text-ink-500">You can edit or close the job from your dashboard.</p>
      </div>
    </form>
  );
}
