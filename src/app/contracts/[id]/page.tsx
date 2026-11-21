import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar, Badge } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { CONTRACT_STATUS_LABELS, MILESTONE_STATUS_LABELS } from '@/lib/constants';
import { formatMoney } from '@/lib/money';
import { timeAgo } from '@/lib/utils';
import {
  addMilestoneAction,
  completeContractAction,
  releaseMilestoneAction,
  reviewAction,
  sendMessageAction,
  submitMilestoneAction,
} from '@/server/actions/contracts';

export const metadata: Metadata = { title: 'Contract' };

type Params = Promise<{ id: string }>;

export default async function ContractPage({ params }: { params: Params }) {
  const { id } = await params;
  const user = await requireUser(`/contracts/${id}`);

  const contract = await db.contract.findUnique({
    where: { id },
    include: {
      client: true,
      freelancer: true,
      milestones: { orderBy: { createdAt: 'asc' } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: true } },
      ledger: { orderBy: { createdAt: 'desc' } },
      review: true,
      job: { select: { id: true, title: true } },
    },
  });

  if (!contract) notFound();
  if (contract.clientId !== user.id && contract.freelancerId !== user.id) notFound();

  const isClient = contract.clientId === user.id;
  const counterpart = isClient ? contract.freelancer : contract.client;
  const released = contract.milestones.filter((milestone) => milestone.status === 'RELEASED');
  const releasedTotal = released.reduce((total, milestone) => total + milestone.amount, 0);
  const fundedTotal = contract.milestones.reduce((total, milestone) => total + milestone.amount, 0);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge tone={contract.status === 'ACTIVE' ? 'green' : 'neutral'}>
              {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
            </Badge>
            {contract.job ? (
              <Link href={`/jobs/${contract.job.id}`} className="text-xs text-ink-500 hover:text-ink-950">
                {contract.job.title}
              </Link>
            ) : null}
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{contract.title}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {isClient ? 'You are hiring' : 'You are working with'}{' '}
            <Link href={`/talent/${counterpart.handle}`} className="font-medium text-brand-700 hover:underline">
              {counterpart.name}
            </Link>{' '}
            · started {timeAgo(contract.startedAt)}
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white px-5 py-4 text-right shadow-card">
          <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Contract value</p>
          <p className="mt-1 text-2xl font-semibold">{formatMoney(contract.totalAmount)}</p>
          <p className="text-xs text-ink-500">
            {formatMoney(releasedTotal)} released of {formatMoney(fundedTotal)} funded
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Milestones</h2>
              <span className="text-xs text-ink-500">{contract.milestones.length} total</span>
            </CardHeader>
            <CardBody className="space-y-3">
              {contract.milestones.length === 0 ? (
                <p className="text-sm text-ink-500">No milestones yet.</p>
              ) : (
                contract.milestones.map((milestone) => (
                  <div key={milestone.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-950">{milestone.title}</p>
                        {milestone.description ? (
                          <p className="mt-1 text-xs leading-5 text-ink-500">{milestone.description}</p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatMoney(milestone.amount)}</p>
                        <Badge
                          tone={
                            milestone.status === 'RELEASED'
                              ? 'green'
                              : milestone.status === 'SUBMITTED'
                                ? 'amber'
                                : 'neutral'
                          }
                        >
                          {MILESTONE_STATUS_LABELS[milestone.status] ?? milestone.status}
                        </Badge>
                      </div>
                    </div>

                    {milestone.status !== 'RELEASED' ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!isClient && (milestone.status === 'FUNDED' || milestone.status === 'IN_PROGRESS') ? (
                          <form action={submitMilestoneAction}>
                            <input type="hidden" name="milestoneId" value={milestone.id} />
                            <Button type="submit" size="sm" variant="outline">
                              Submit for review
                            </Button>
                          </form>
                        ) : null}
                        {isClient ? (
                          <form action={releaseMilestoneAction}>
                            <input type="hidden" name="milestoneId" value={milestone.id} />
                            <Button type="submit" size="sm">
                              Release {formatMoney(milestone.amount)}
                            </Button>
                          </form>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-ink-500">
                        Released {milestone.releasedAt ? timeAgo(milestone.releasedAt) : ''}
                      </p>
                    )}
                  </div>
                ))
              )}

              {isClient && contract.status === 'ACTIVE' ? (
                <details className="rounded-xl bg-ink-50 p-4">
                  <summary className="cursor-pointer text-sm font-medium text-ink-900">Add a milestone</summary>
                  <form action={async (formData: FormData) => { await addMilestoneAction(null, formData); }} className="mt-4 space-y-3">
                    <input type="hidden" name="contractId" value={contract.id} />
                    <Field label="Title" htmlFor="milestone-title">
                      <Input id="milestone-title" name="title" placeholder="Design handoff" required />
                    </Field>
                    <Field label="Amount (cents)" htmlFor="milestone-amount">
                      <Input id="milestone-amount" name="amount" type="number" min={100} step={100} required />
                    </Field>
                    <Field label="Notes" htmlFor="milestone-notes" hint="Optional">
                      <Input id="milestone-notes" name="description" placeholder="What gets delivered" />
                    </Field>
                    <Button type="submit" size="sm">
                      Fund milestone (simulated)
                    </Button>
                  </form>
                </details>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Messages</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {contract.messages.length === 0 ? (
                  <p className="text-sm text-ink-500">No messages yet. Say hello and share the first step.</p>
                ) : (
                  contract.messages.map((message) => {
                    const mine = message.senderId === user.id;
                    return (
                      <div key={message.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                          className={
                            mine
                              ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2.5 text-sm text-white'
                              : 'max-w-[80%] rounded-2xl rounded-bl-sm bg-ink-100 px-4 py-2.5 text-sm text-ink-900'
                          }
                        >
                          <p className="whitespace-pre-wrap">{message.body}</p>
                          <p className={mine ? 'mt-1 text-[10px] text-white/70' : 'mt-1 text-[10px] text-ink-500'}>
                            {message.sender.name.split(' ')[0]} · {timeAgo(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form action={sendMessageAction} className="flex gap-2 border-t border-ink-100 pt-4">
                <input type="hidden" name="contractId" value={contract.id} />
                <Input name="body" placeholder="Write a message…" required className="flex-1" />
                <Button type="submit">Send</Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">{isClient ? 'Your specialist' : 'Your client'}</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={counterpart.name} hue={counterpart.avatarHue} size={44} />
                <div className="min-w-0">
                  <Link href={`/talent/${counterpart.handle}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                    {counterpart.name}
                  </Link>
                  <p className="truncate text-xs text-ink-500">{counterpart.headline}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Ledger (simulated)</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {contract.ledger.length === 0 ? (
                <p className="text-xs text-ink-500">No entries yet.</p>
              ) : (
                contract.ledger.map((entry) => (
                  <div key={entry.id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{entry.kind}</p>
                      <p className="truncate text-ink-500">{entry.note}</p>
                    </div>
                    <span className={entry.kind === 'RELEASE' ? 'font-semibold text-brand-700' : 'text-ink-700'}>
                      {formatMoney(entry.amount)}
                    </span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {contract.review ? (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold">Review</h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm font-semibold">{contract.review.rating} / 5</p>
                <p className="mt-1 text-xs leading-5 text-ink-500">{contract.review.comment}</p>
              </CardBody>
            </Card>
          ) : contract.status === 'COMPLETED' ? (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold">Leave a review</h2>
              </CardHeader>
              <CardBody>
                <form action={async (formData: FormData) => { await reviewAction(null, formData); }} className="space-y-3">
                  <input type="hidden" name="contractId" value={contract.id} />
                  <Field label="Rating" htmlFor="rating">
                    <select id="rating" name="rating" className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm" defaultValue="5">
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} / 5
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Comment" htmlFor="comment">
                    <textarea id="comment" name="comment" rows={3} className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm" />
                  </Field>
                  <Button type="submit" size="sm">
                    Post review
                  </Button>
                </form>
              </CardBody>
            </Card>
          ) : null}

          {contract.status === 'ACTIVE' ? (
            <form action={completeContractAction}>
              <input type="hidden" name="contractId" value={contract.id} />
              <Button type="submit" variant="outline" className="w-full">
                Mark contract complete
              </Button>
            </form>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
