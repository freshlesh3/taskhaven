import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, EmptyState } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Audit log' };

const TONES: Record<string, 'green' | 'amber' | 'red' | 'neutral'> = {
  JOB_HIDDEN: 'amber',
  JOB_UNHIDDEN: 'green',
  JOB_CLOSED: 'neutral',
  JOB_REOPENED: 'green',
  USER_SUSPENDED: 'red',
  USER_REINSTATED: 'green',
  REPORT_RESOLVED: 'green',
  REPORT_DISMISSED: 'neutral',
};

export default async function AuditPage() {
  const user = await requireUser('/admin/audit');
  if (user.role !== 'ADMIN') redirect('/dashboard?error=admins-only');

  const entries = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { actor: true },
  });

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Audit log</h1>
          <p className="mt-2 text-sm text-ink-500">Every privileged action, newest first. Append-only.</p>
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/admin" className="text-ink-500 hover:text-ink-950">
            Overview
          </Link>
          <Link href="/admin/reports" className="text-ink-500 hover:text-ink-950">
            Reports
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {entries.length === 0 ? (
          <EmptyState
            title="Nothing recorded yet"
            description="Hiding a job, suspending an account or resolving a report writes an entry here."
          />
        ) : (
          <Card className="divide-y divide-ink-100">
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Badge tone={TONES[entry.action] ?? 'neutral'}>{entry.action.replaceAll('_', ' ').toLowerCase()}</Badge>
                <span className="text-xs text-ink-500">
                  {entry.targetType.toLowerCase()} · {entry.targetId.slice(0, 12)}…
                </span>
                {entry.detail ? <span className="min-w-0 flex-1 truncate text-xs text-ink-700">{entry.detail}</span> : null}
                <span className="ml-auto text-xs text-ink-500">
                  {entry.actor.name} · {timeAgo(entry.createdAt)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
