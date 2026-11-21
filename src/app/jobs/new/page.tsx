import type { Metadata } from 'next';
import { JobForm } from '@/components/forms/job-form';
import { requireUser } from '@/lib/auth';

export const metadata: Metadata = { title: 'Post a job' };

export default async function NewJobPage() {
  const user = await requireUser('/jobs/new');

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Post a job</h1>
        <p className="mt-2 text-sm text-ink-500">
          Describe the outcome. Clear briefs get sharper proposals — you can refine the brief later without losing
          anyone who already applied.
        </p>

        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <JobForm />
        </div>

        <p className="mt-6 text-xs text-ink-500">
          Posting as {user.name}. Jobs are public by default; private jobs are planned for a later release — see the
          roadmap in the repository.
        </p>
      </div>
    </div>
  );
}
