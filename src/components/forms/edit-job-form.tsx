'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Textarea } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/constants';
import { updateJobAction, type FormState } from '@/server/actions/jobs';

type JobValues = {
  id: string;
  title: string;
  description: string;
  category: string;
  budgetType: string;
  budgetMin: number | null;
  budgetMax: number | null;
  experience: string;
  duration: string;
  skills: string;
};

export function EditJobForm({ job }: { job: JobValues }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateJobAction, null);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="jobId" value={job.id} />

      <Field label="Job title" htmlFor="title" error={state?.fieldErrors?.title}>
        <Input id="title" name="title" defaultValue={job.title} required />
      </Field>

      <Field label="Description" htmlFor="description" error={state?.fieldErrors?.description}>
        <Textarea id="description" name="description" rows={10} defaultValue={job.description} required />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category" htmlFor="category">
          <Select id="category" name="category" defaultValue={job.category}>
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Experience level" htmlFor="experience">
          <Select id="experience" name="experience" defaultValue={job.experience}>
            <option value="ENTRY">Entry level</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="EXPERT">Expert</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Budget type" htmlFor="budgetType">
          <Select id="budgetType" name="budgetType" defaultValue={job.budgetType}>
            <option value="FIXED">Fixed price</option>
            <option value="HOURLY">Hourly</option>
          </Select>
        </Field>
        <Field label="Minimum (cents)" htmlFor="budgetMin">
          <Input id="budgetMin" name="budgetMin" type="number" min={0} step={100} defaultValue={job.budgetMin ?? ''} />
        </Field>
        <Field label="Maximum (cents)" htmlFor="budgetMax" error={state?.fieldErrors?.budgetMax}>
          <Input id="budgetMax" name="budgetMax" type="number" min={0} step={100} defaultValue={job.budgetMax ?? ''} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected duration" htmlFor="duration">
          <Input id="duration" name="duration" defaultValue={job.duration} />
        </Field>
        <Field label="Skills" htmlFor="skills" hint="Comma separated">
          <Input id="skills" name="skills" defaultValue={job.skills} />
        </Field>
      </div>

      {state?.error ? <p className="text-sm font-medium text-red-600">{state.error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
        <Link href={`/jobs/${job.id}`} className="text-sm text-ink-500 hover:text-ink-950">
          Cancel
        </Link>
      </div>
    </form>
  );
}
