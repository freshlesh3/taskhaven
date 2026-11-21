import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, CalendarClock, MapPin, Users } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar, Badge, Stars } from '@/components/ui/avatar';
import { Button, ButtonLink } from '@/components/ui/button';
import { ProposalForm } from '@/components/forms/proposal-form';
import { ProposalActions } from '@/components/forms/proposal-actions';
import { ReportForm } from '@/components/forms/report-form';
import { getJob } from '@/server/queries';
import { getCurrentUser } from '@/lib/auth';
import { formatBudget, formatMoney } from '@/lib/money';
import { BUDGET_LABELS, EXPERIENCE_LABELS, PROPOSAL_STATUS_LABELS, categoryLabel } from '@/lib/constants';
import { timeAgo } from '@/lib/utils';

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  return { title: job?.title ?? 'Job' };
}

export default async function JobDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const [job, user] = await Promise.all([getJob(id), getCurrentUser()]);
  if (!job) notFound();

  const isOwner = user?.id === job.clientId;
  const myProposal = user ? job.proposals.find((proposal) => proposal.freelancerId === user.id) : undefined;
  const rating =
    job.proposals.length > 0
      ? job.proposals.reduce((total, proposal) => total + proposal.bidAmount, 0) / job.proposals.length
      : null;

  return (
    <div className="container-page py-10">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-950">
        <ArrowLeft className="h-4 w-4" /> Back to jobs
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">{categoryLabel(job.category)}</Badge>
            <Badge>{BUDGET_LABELS[job.budgetType]}</Badge>
            <Badge tone={job.status === 'OPEN' ? 'green' : 'neutral'}>{job.status === 'OPEN' ? 'Open' : 'Closed'}</Badge>
            <span className="text-xs text-ink-500">Posted {timeAgo(job.createdAt)}</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{job.title}</h1>

          <dl className="mt-6 grid gap-4 rounded-2xl border border-ink-100 bg-ink-50/60 p-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Budget</dt>
              <dd className="mt-1 text-sm font-semibold">
                {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Experience</dt>
              <dd className="mt-1 text-sm font-semibold">{EXPERIENCE_LABELS[job.experience]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-ink-500">Duration</dt>
              <dd className="mt-1 text-sm font-semibold">{job.duration ?? 'Not specified'}</dd>
            </div>
          </dl>

          <div className="mt-8 space-y-4 text-[15px] leading-7 text-ink-700">
            {job.description.split(/\n{2,}/).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {job.skills.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-ink-950">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {job.skills.map(({ skill }) => (
                  <Badge key={skill.id}>{skill.name}</Badge>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-ink-100 pt-5 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" /> {job.proposals.length} proposals
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" /> {job.duration ?? 'Flexible timeline'}
            </span>
            {job.client.country ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {job.client.country}
              </span>
            ) : null}
          </div>
        </div>

        <aside className="space-y-5">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-ink-950">About the client</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar name={job.client.name} hue={job.client.avatarHue} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{job.client.name}</p>
                  <p className="truncate text-xs text-ink-500">{job.client.headline ?? 'Client on Taskhaven'}</p>
                </div>
              </div>
              <p className="text-xs text-ink-500">
                {job.client.country ?? 'Location not set'} · member since{' '}
                {new Date(job.client.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-ink-950">
                {isOwner ? `Proposals (${job.proposals.length})` : myProposal ? 'Your proposal' : 'Send a proposal'}
              </h2>
            </CardHeader>
            <CardBody>
              {!user ? (
                <div className="space-y-3">
                  <p className="text-sm text-ink-500">Log in to send a proposal and track it from your dashboard.</p>
                  <ButtonLink href={`/login?next=/jobs/${job.id}`} className="w-full">
                    Log in to apply
                  </ButtonLink>
                </div>
              ) : isOwner ? (
                job.proposals.length === 0 ? (
                  <p className="text-sm text-ink-500">No proposals yet. Share the job link to get the first one.</p>
                ) : (
                  <ul className="space-y-4">
                    {job.proposals.map((proposal) => (
                      <li key={proposal.id} className="rounded-xl border border-ink-100 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link href={`/talent/${proposal.freelancer.handle}`} className="truncate text-sm font-semibold hover:text-brand-700">
                              {proposal.freelancer.name}
                            </Link>
                            <p className="truncate text-xs text-ink-500">{proposal.freelancer.headline}</p>
                          </div>
                          <Badge tone={proposal.status === 'ACCEPTED' ? 'green' : 'neutral'}>
                            {PROPOSAL_STATUS_LABELS[proposal.status] ?? proposal.status}
                          </Badge>
                        </div>
                        <p className="mt-2 line-clamp-4 text-xs leading-5 text-ink-700">{proposal.coverLetter}</p>
                        <div className="mt-3 flex items-center justify-between text-xs">
                          <span className="font-semibold">{formatMoney(proposal.bidAmount)}</span>
                          <span className="text-ink-500">{proposal.deliveryDays} days</span>
                        </div>
                        {proposal.status !== 'ACCEPTED' && job.status === 'OPEN' ? (
                          <div className="mt-3">
                            <ProposalActions proposalId={proposal.id} />
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )
              ) : job.status === 'OPEN' ? (
                <div className="space-y-4">
                  {user && !user.emailVerifiedAt ? (
                    <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                      Confirm your email before sending proposals.{' '}
                      <Link href="/verify-notice" className="font-semibold underline">
                        Resend the link
                      </Link>
                    </div>
                  ) : null}
                  {myProposal ? (
                    <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-900">
                      You already proposed {formatMoney(myProposal.bidAmount)} · {PROPOSAL_STATUS_LABELS[myProposal.status]}
                    </div>
                  ) : null}
                  {user?.emailVerifiedAt ? (
                    <ProposalForm jobId={job.id} suggestedBid={rating ? Math.round(rating) : undefined} />
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-ink-500">This job is closed to new proposals.</p>
              )}
            </CardBody>
          </Card>

          {isOwner ? (
            <div className="flex gap-2">
              <ButtonLink href={`/jobs/${job.id}/edit`} variant="outline" className="w-full">
                Edit job
              </ButtonLink>
              <ButtonLink href="/dashboard/jobs" variant="outline" className="w-full">
                Manage my jobs
              </ButtonLink>
            </div>
          ) : null}

          {user && !isOwner ? <ReportForm targetType="JOB" targetId={job.id} label="Report this job" /> : null}
        </aside>
      </div>
    </div>
  );
}
