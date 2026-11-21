import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, CardBody, EmptyState } from '@/components/ui/card';
import { Avatar, Badge } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { REPORT_REASON_LABELS } from '@/lib/constants';
import { resolveReportAction } from '@/server/actions/admin';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Reports' };

export default async function ReportsPage() {
  const user = await requireUser('/admin/reports');
  if (user.role !== 'ADMIN') redirect('/dashboard?error=admins-only');

  const reports = await db.report.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    take: 100,
    include: { reporter: true, resolvedBy: true },
  });

  const jobs = await db.job.findMany({
    where: { id: { in: reports.filter((r) => r.targetType === 'JOB').map((r) => r.targetId) } },
    select: { id: true, title: true, client: { select: { name: true } } },
  });
  const people = await db.user.findMany({
    where: { id: { in: reports.filter((r) => r.targetType === 'USER').map((r) => r.targetId) } },
    select: { id: true, name: true, handle: true, isSuspended: true },
  });

  const jobMap = new Map(jobs.map((job) => [job.id, job]));
  const peopleMap = new Map(people.map((person) => [person.id, person]));
  const open = reports.filter((report) => report.status === 'OPEN').length;

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 text-sm text-ink-500">
            {open === 0 ? 'Nothing waiting on you.' : `${open} open ${open === 1 ? 'report' : 'reports'}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/audit" className="text-sm text-ink-500 hover:text-ink-950">
            Audit log
          </Link>
          <Link href="/admin" className="text-sm text-ink-500 hover:text-ink-950">
            Overview
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-3">
        {reports.length === 0 ? (
          <EmptyState title="No reports" description="Flags from members will appear here for review." />
        ) : (
          reports.map((report) => {
            const job = report.targetType === 'JOB' ? jobMap.get(report.targetId) : undefined;
            const person = report.targetType === 'USER' ? peopleMap.get(report.targetId) : undefined;

            return (
              <Card key={report.id} className={report.status === 'OPEN' ? 'p-5' : 'p-5 opacity-80'}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={report.status === 'OPEN' ? 'amber' : 'neutral'}>{report.status.toLowerCase()}</Badge>
                      <Badge>{report.targetType.toLowerCase()}</Badge>
                      <span className="text-xs text-ink-500">{REPORT_REASON_LABELS[report.reason] ?? report.reason}</span>
                      <span className="text-xs text-ink-500">· {timeAgo(report.createdAt)}</span>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-ink-950">
                      {job ? (
                        <Link href={`/jobs/${job.id}`} className="hover:text-brand-700">
                          {job.title}
                        </Link>
                      ) : person ? (
                        <Link href={`/talent/${person.handle}`} className="hover:text-brand-700">
                          {person.name}
                        </Link>
                      ) : (
                        <span className="text-ink-500">Target no longer exists</span>
                      )}
                    </p>

                    {job ? <p className="text-xs text-ink-500">Posted by {job.client.name}</p> : null}
                    {person ? (
                      <p className="text-xs text-ink-500">
                        {person.isSuspended ? 'Currently suspended' : 'Currently active'}
                      </p>
                    ) : null}

                    {report.details ? (
                      <p className="mt-2 max-w-2xl text-xs leading-5 text-ink-700">“{report.details}”</p>
                    ) : null}

                    <div className="mt-2 flex items-center gap-2 text-xs text-ink-500">
                      <Avatar name={report.reporter.name} hue={report.reporter.avatarHue} size={20} />
                      Reported by {report.reporter.name}
                      {report.resolvedBy ? ` · handled by ${report.resolvedBy.name}` : ''}
                    </div>
                  </div>

                  {report.status === 'OPEN' ? (
                    <div className="flex flex-wrap gap-2">
                      <form action={resolveReportAction}>
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="outcome" value="RESOLVED" />
                        <input type="hidden" name="alsoAct" value={report.targetType === 'JOB' ? 'hide' : 'suspend'} />
                        <Button type="submit" size="sm">
                          {report.targetType === 'JOB' ? 'Hide job' : 'Suspend account'}
                        </Button>
                      </form>
                      <form action={resolveReportAction}>
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="outcome" value="RESOLVED" />
                        <input type="hidden" name="alsoAct" value="none" />
                        <Button type="submit" size="sm" variant="outline">
                          Resolve only
                        </Button>
                      </form>
                      <form action={resolveReportAction}>
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="outcome" value="DISMISSED" />
                        <input type="hidden" name="alsoAct" value="none" />
                        <Button type="submit" size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <p className="text-xs text-ink-500">
                      {report.resolvedAt ? `Closed ${timeAgo(report.resolvedAt)}` : 'Closed'}
                    </p>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
