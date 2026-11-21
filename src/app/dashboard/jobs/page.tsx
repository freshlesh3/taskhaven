import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, EmptyState } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { categoryLabel } from '@/lib/constants';
import { formatBudget } from '@/lib/money';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'My jobs' };

export default async function MyJobsPage() {
  const user = await requireUser('/dashboard/jobs');
  const jobs = await db.job.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { proposals: true, contracts: true } } },
  });

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">My jobs</h1>
          <p className="mt-2 text-sm text-ink-500">Post, review proposals and close roles when you have hired.</p>
        </div>
        <ButtonLink href="/jobs/new">Post a job</ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {jobs.length === 0 ? (
          <EmptyState
            title="You have not posted a job yet"
            description="Write a short brief, set a budget and publish. Proposals usually arrive within a day."
            action={<ButtonLink href="/jobs/new">Post your first job</ButtonLink>}
          />
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${job.id}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                    {job.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-500">
                    {categoryLabel(job.category)} · {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)} · posted{' '}
                    {timeAgo(job.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-500">{job._count.proposals} proposals</span>
                  <Badge tone={job.status === 'OPEN' ? 'green' : 'neutral'}>{job.status.toLowerCase()}</Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
