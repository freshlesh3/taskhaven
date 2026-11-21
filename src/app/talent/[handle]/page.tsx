import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { MapPin, Clock } from 'lucide-react';
import { getUserByHandle } from '@/server/queries';
import { getCurrentUser } from '@/lib/auth';
import { ReportForm } from '@/components/forms/report-form';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Avatar, Badge, Stars } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { formatMoney, formatRate } from '@/lib/money';
import { timeAgo } from '@/lib/utils';

type Params = Promise<{ handle: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { handle } = await params;
  const person = await getUserByHandle(handle);
  return { title: person ? person.name : 'Profile' };
}

export default async function TalentProfilePage({ params }: { params: Params }) {
  const { handle } = await params;
  const [person, viewer] = await Promise.all([getUserByHandle(handle), getCurrentUser()]);
  if (!person) notFound();

  const ratings = person.reviewsReceived.map((review) => review.rating);
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const totalEarned = person.reviewsReceived.length ? null : null;

  return (
    <div className="container-page py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-start gap-5">
            <Avatar name={person.name} hue={person.avatarHue} size={76} />
            <div className="min-w-0">
              <h1 className="text-3xl font-semibold tracking-tight">{person.name}</h1>
              <p className="mt-1 text-sm text-ink-500">{person.headline ?? 'Independent specialist'}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                {ratings.length ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Stars rating={average} /> {average.toFixed(1)} · {ratings.length} reviews
                  </span>
                ) : (
                  <span>New to Taskhaven</span>
                )}
                {person.country ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {person.country}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Joined {new Date(person.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                {person.isAvailable ? <Badge tone="green">Available now</Badge> : <Badge>Busy</Badge>}
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-ink-950">About</h2>
            <p className="prose-readable mt-3 whitespace-pre-line">{person.bio ?? 'This member has not written a bio yet.'}</p>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-ink-950">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {person.skills.length ? (
                person.skills.map((entry) => (
                  <Badge key={entry.skill.id} tone="green">
                    {entry.skill.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-ink-500">No skills listed.</p>
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-ink-950">Work history</h2>
            {person.contractsWork.length ? (
              <ul className="mt-3 space-y-2">
                {person.contractsWork.map((contract) => (
                  <li key={contract.id} className="rounded-xl border border-ink-100 px-4 py-3 text-sm">
                    {contract.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">No completed contracts yet.</p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-semibold text-ink-950">Reviews</h2>
            {person.reviewsReceived.length ? (
              <ul className="mt-3 space-y-3">
                {person.reviewsReceived.map((review) => (
                  <li key={review.id} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={review.author.name} hue={review.author.avatarHue} size={28} />
                        <span className="text-sm font-medium">{review.author.name}</span>
                      </div>
                      <Stars rating={review.rating} />
                    </div>
                    {review.comment ? <p className="mt-2 text-sm leading-6 text-ink-700">{review.comment}</p> : null}
                    <p className="mt-1 text-xs text-ink-500">{timeAgo(review.createdAt)}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-ink-500">No reviews yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-ink-500">Hourly rate</p>
                {person.isSuspended ? <Badge tone="red">Suspended</Badge> : null}
              </div>
              <p className="text-2xl font-semibold">{formatRate(person.hourlyRate)}</p>
              <ButtonLink href="/jobs/new" className="w-full">
                Invite to a job
              </ButtonLink>
              <p className="text-center text-xs text-ink-500">
                Post a brief and mention {person.name.split(' ')[0]}.
              </p>
              {viewer && viewer.id !== person.id ? (
                <ReportForm targetType="USER" targetId={person.id} label="Report this profile" />
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold">Open jobs from this client</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {person.jobs.length ? (
                person.jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-lg border border-ink-100 p-3 hover:bg-ink-50">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatMoney(job.budgetMin)} · {job.proposalCount} proposals
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-ink-500">No open jobs right now.</p>
              )}
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
