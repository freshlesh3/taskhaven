import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { getJob } from '@/server/queries';
import { EditJobForm } from '@/components/forms/edit-job-form';

export const metadata: Metadata = { title: 'Edit job' };

type Params = Promise<{ id: string }>;

export default async function EditJobPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/jobs/${id}/edit`);
  const job = await getJob(id);
  if (!job) notFound();
  if (job.clientId !== user.id) notFound();

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl">
        <Link href={`/jobs/${job.id}`} className="text-sm text-ink-500 hover:text-ink-950">
          ← Back to the job
        </Link>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Edit job</h1>
        <p className="mt-2 text-sm text-ink-500">
          Anyone who already proposed keeps their proposal. Big changes are worth a note to shortlisted candidates.
        </p>

        <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          <EditJobForm
            job={{
              id: job.id,
              title: job.title,
              description: job.description,
              category: job.category,
              budgetType: job.budgetType,
              budgetMin: job.budgetMin,
              budgetMax: job.budgetMax,
              experience: job.experience,
              duration: job.duration ?? '',
              skills: job.skills.map((entry) => entry.skill.name).join(', '),
            }}
          />
        </div>
      </div>
    </div>
  );
}
