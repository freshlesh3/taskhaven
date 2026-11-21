import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar, Badge } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { closeJobAction, hideJobAction, suspendUserAction } from '@/server/actions/admin';
import { categoryLabel } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Admin' };

export default async function AdminPage() {
  const user = await requireUser('/admin');
  if (user.role !== 'ADMIN') redirect('/dashboard?error=admins-only');

  const [users, jobs, counts] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { _count: { select: { jobs: true, proposals: true } } } }),
    db.job.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { client: true, _count: { select: { proposals: true } } } }),
    Promise.all([
      db.user.count(),
      db.job.count(),
      db.proposal.count(),
      db.contract.count(),
      db.job.count({ where: { isHidden: true } }),
      db.user.count({ where: { isSuspended: true } }),
    ]),
  ]);

  const [userCount, jobCount, proposalCount, contractCount, hiddenJobs, suspendedUsers] = counts;

  const stats = [
    { label: 'Members', value: userCount },
    { label: 'Jobs', value: jobCount },
    { label: 'Proposals', value: proposalCount },
    { label: 'Contracts', value: contractCount },
    { label: 'Hidden jobs', value: hiddenJobs },
    { label: 'Suspended', value: suspendedUsers },
  ];

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Moderation</h1>
      <p className="mt-2 text-sm text-ink-500">
        Hide listings and suspend accounts. Actions are immediate and logged in the database.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-2xl font-semibold">{stat.value}</p>
            <p className="text-xs text-ink-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Members</h2>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100">
            {users.map((member) => (
              <div key={member.id} className="flex items-center gap-3 py-3">
                <Avatar name={member.name} hue={member.avatarHue} size={34} />
                <div className="min-w-0 flex-1">
                  <Link href={`/talent/${member.handle}`} className="block truncate text-sm font-medium hover:text-brand-700">
                    {member.name}
                  </Link>
                  <p className="truncate text-xs text-ink-500">
                    {member.role.toLowerCase()} · {member._count.jobs} jobs · {member._count.proposals} proposals
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {member.isSuspended ? <Badge tone="red">suspended</Badge> : null}
                  {member.role === 'ADMIN' ? (
                    <Badge tone="green">admin</Badge>
                  ) : (
                    <form action={suspendUserAction}>
                      <input type="hidden" name="userId" value={member.id} />
                      <input type="hidden" name="suspended" value={member.isSuspended ? 'false' : 'true'} />
                      <Button type="submit" size="sm" variant={member.isSuspended ? 'outline' : 'danger'}>
                        {member.isSuspended ? 'Reinstate' : 'Suspend'}
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Jobs</h2>
          </CardHeader>
          <CardBody className="divide-y divide-ink-100">
            {jobs.map((job) => (
              <div key={job.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/jobs/${job.id}`} className="block truncate text-sm font-medium hover:text-brand-700">
                    {job.title}
                  </Link>
                  <p className="truncate text-xs text-ink-500">
                    {categoryLabel(job.category)} · {job.client.name} · {job._count.proposals} proposals ·{' '}
                    {timeAgo(job.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {job.isHidden ? <Badge tone="red">hidden</Badge> : <Badge>{job.status.toLowerCase()}</Badge>}
                  <form action={hideJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <input type="hidden" name="hidden" value={job.isHidden ? 'false' : 'true'} />
                    <Button type="submit" size="sm" variant="outline">
                      {job.isHidden ? 'Unhide' : 'Hide'}
                    </Button>
                  </form>
                  <form action={closeJobAction}>
                    <input type="hidden" name="jobId" value={job.id} />
                    <input type="hidden" name="status" value={job.status === 'OPEN' ? 'CLOSED' : 'OPEN'} />
                    <Button type="submit" size="sm" variant="ghost">
                      {job.status === 'OPEN' ? 'Close' : 'Reopen'}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
