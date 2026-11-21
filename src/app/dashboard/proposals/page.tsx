import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Card, EmptyState } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { Button, ButtonLink } from '@/components/ui/button';
import { withdrawProposalAction } from '@/server/actions/jobs';
import { PROPOSAL_STATUS_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/money';
import { timeAgo, truncate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Proposals' };

export default async function ProposalsPage() {
  const user = await requireUser('/dashboard/proposals');
  const proposals = await db.proposal.findMany({
    where: { freelancerId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { job: { include: { client: true } } },
  });

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Proposals</h1>
          <p className="mt-2 text-sm text-ink-500">Everything you have pitched, newest first.</p>
        </div>
        <ButtonLink href="/jobs" variant="outline">
          Find more work
        </ButtonLink>
      </div>

      <div className="mt-8 space-y-3">
        {proposals.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Find a job that matches your skills and send your first pitch."
            action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
          />
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/jobs/${proposal.jobId}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                    {proposal.job.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-500">
                    {proposal.job.client.name} · sent {timeAgo(proposal.createdAt)} · {proposal.deliveryDays} days
                  </p>
                  <p className="mt-2 text-xs leading-5 text-ink-500">{truncate(proposal.coverLetter, 180)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatMoney(proposal.bidAmount)}</p>
                  <Badge tone={proposal.status === 'ACCEPTED' ? 'green' : proposal.status === 'DECLINED' ? 'red' : 'neutral'}>
                    {PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status}
                  </Badge>
                  {proposal.status === 'SUBMITTED' || proposal.status === 'SHORTLISTED' ? (
                    <form action={withdrawProposalAction} className="mt-2">
                      <input type="hidden" name="proposalId" value={proposal.id} />
                      <Button type="submit" size="sm" variant="ghost">
                        Withdraw
                      </Button>
                    </form>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
