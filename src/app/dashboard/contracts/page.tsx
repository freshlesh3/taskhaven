import Link from 'next/link';
import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { listMyContracts } from '@/server/queries';
import { Card, CardBody, EmptyState } from '@/components/ui/card';
import { Avatar, Badge } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { CONTRACT_STATUS_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/money';
import { timeAgo } from '@/lib/utils';

export const metadata: Metadata = { title: 'Contracts' };

export default async function ContractsPage() {
  const user = await requireUser('/dashboard/contracts');
  const contracts = await listMyContracts(user.id);

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Contracts</h1>
      <p className="mt-2 text-sm text-ink-500">Every engagement you are part of, with milestones and messages.</p>

      <div className="mt-8 space-y-3">
        {contracts.length === 0 ? (
          <EmptyState
            title="No contracts yet"
            description="Accept a proposal on one of your jobs, or win a proposal of your own."
            action={<ButtonLink href="/jobs">Browse jobs</ButtonLink>}
          />
        ) : (
          contracts.map((contract) => {
            const counterpart = contract.clientId === user.id ? contract.freelancer : contract.client;
            const released = contract.milestones.filter((milestone) => milestone.status === 'RELEASED').length;
            return (
              <Card key={contract.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={counterpart.name} hue={counterpart.avatarHue} size={40} />
                    <div className="min-w-0">
                      <Link href={`/contracts/${contract.id}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                        {contract.title}
                      </Link>
                      <p className="truncate text-xs text-ink-500">
                        {contract.clientId === user.id ? 'Hiring' : 'Working with'} {counterpart.name} · started{' '}
                        {timeAgo(contract.startedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatMoney(contract.totalAmount)}</p>
                      <p className="text-xs text-ink-500">
                        {released}/{contract.milestones.length} milestones released
                      </p>
                    </div>
                    <Badge tone={contract.status === 'ACTIVE' ? 'green' : 'neutral'}>
                      {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
