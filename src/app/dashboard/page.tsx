import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowUpRight, Briefcase, FileText, Handshake, Wallet } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { getDashboardData, listMyContracts } from '@/server/queries';
import { Card, CardBody, CardHeader, EmptyState } from '@/components/ui/card';
import { Avatar, Badge } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { CONTRACT_STATUS_LABELS, PROPOSAL_STATUS_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/money';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const user = await requireUser('/dashboard');
  const [stats, contracts, proposals, jobs] = await Promise.all([
    getDashboardData(user.id),
    listMyContracts(user.id),
    db.proposal.findMany({
      where: { freelancerId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { job: true },
    }),
    db.job.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { _count: { select: { proposals: true } } },
    }),
  ]);

  const cards = [
    { label: 'Active contracts', value: stats.contracts, icon: Handshake, href: '/dashboard/contracts' },
    { label: 'Open job posts', value: stats.openJobs, icon: Briefcase, href: '/dashboard/jobs' },
    { label: 'Proposals out', value: stats.proposals, icon: FileText, href: '/dashboard/proposals' },
    { label: 'Released to you', value: formatMoney(stats.earned), icon: Wallet, href: '/dashboard/contracts' },
  ];

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">Welcome back</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{user.name.split(' ')[0]}</h1>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/jobs/new" variant="outline">
            Post a job
          </ButtonLink>
          <ButtonLink href="/jobs">Find work</ButtonLink>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="group">
            <Card className="p-5 transition-shadow group-hover:shadow-pop">
              <div className="flex items-center justify-between">
                <card.icon className="h-5 w-5 text-brand-700" />
                <ArrowUpRight className="h-4 w-4 text-ink-300 transition-colors group-hover:text-ink-950" />
              </div>
              <p className="mt-4 text-2xl font-semibold">{card.value}</p>
              <p className="text-xs text-ink-500">{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Contracts</h2>
            <Link href="/dashboard/contracts" className="text-xs font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {contracts.length === 0 ? (
              <p className="text-sm text-ink-500">No contracts yet.</p>
            ) : (
              contracts.slice(0, 4).map((contract) => {
                const counterpart = contract.clientId === user.id ? contract.freelancer : contract.client;
                return (
                  <Link
                    key={contract.id}
                    href={`/contracts/${contract.id}`}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 p-3 hover:bg-ink-50"
                  >
                    <Avatar name={counterpart.name} hue={counterpart.avatarHue} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{contract.title}</p>
                      <p className="truncate text-xs text-ink-500">
                        {counterpart.name} · {formatMoney(contract.totalAmount)}
                      </p>
                    </div>
                    <Badge tone={contract.status === 'ACTIVE' ? 'green' : 'neutral'}>
                      {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your proposals</h2>
            <Link href="/dashboard/proposals" className="text-xs font-medium text-brand-700 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {proposals.length === 0 ? (
              <p className="text-sm text-ink-500">
                No proposals yet.{' '}
                <Link href="/jobs" className="font-medium text-brand-700 hover:underline">
                  Browse open jobs
                </Link>
                .
              </p>
            ) : (
              proposals.map((proposal) => (
                <Link
                  key={proposal.id}
                  href={`/jobs/${proposal.jobId}`}
                  className="block rounded-xl border border-ink-100 p-3 hover:bg-ink-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{proposal.job.title}</p>
                    <Badge tone={proposal.status === 'ACCEPTED' ? 'green' : 'neutral'}>
                      {PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {formatMoney(proposal.bidAmount)} · sent {timeAgo(proposal.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <div className="mt-10">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Jobs you posted</h2>
            <Link href="/dashboard/jobs" className="text-xs font-medium text-brand-700 hover:underline">
              Manage jobs
            </Link>
          </CardHeader>
          <CardBody>
            {jobs.length === 0 ? (
              <EmptyState
                title="No jobs yet"
                description="Post a brief and proposals start arriving. It takes about two minutes."
                action={<ButtonLink href="/jobs/new">Post your first job</ButtonLink>}
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {jobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/jobs/${job.id}`} className="min-w-0 truncate text-sm font-medium hover:text-brand-700">
                      {job.title}
                    </Link>
                    <span className="shrink-0 text-xs text-ink-500">
                      {job._count.proposals} proposals · {job.status.toLowerCase()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
