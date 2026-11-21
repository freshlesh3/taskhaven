import Link from 'next/link';
import { ArrowRight, BadgeCheck, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { SearchBar } from '@/components/site/search-bar';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { CATEGORIES } from '@/lib/constants';
import { listJobs } from '@/server/queries';
import { formatBudget, formatMoney } from '@/lib/money';
import { timeAgo, truncate } from '@/lib/utils';

export default async function HomePage() {
  const { items, total } = await listJobs({ perPage: 4 });

  return (
    <>
      <section className="relative overflow-hidden bg-ink-950 text-white">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(900px 480px at 78% 18%, rgba(95,179,33,0.55), transparent 62%), radial-gradient(700px 500px at 12% 92%, rgba(20,168,0,0.35), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-page px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5" /> Open source · self-hostable · MIT
          </span>

          <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.03em] sm:text-6xl">
            Work at the speed of your ambition
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            Taskhaven connects teams with independent specialists who turn hard problems into finished work — and it is
            yours to run, fork and extend.
          </p>

          <div className="mt-8 max-w-2xl">
            <SearchBar placeholder="Search jobs by skill, title or keyword" />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/signup" size="lg" variant="primary">
              Join Taskhaven <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/jobs/new" size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10">
              Post a job
            </ButtonLink>
            <span className="text-sm text-white/60">{total} open roles right now</span>
          </div>

          <dl className="mt-14 grid max-w-3xl gap-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, label: 'Milestone escrow', value: 'Funds release on approval' },
              { icon: BadgeCheck, label: 'Verified profiles', value: 'Skills, rates and reviews' },
              { icon: Clock, label: 'Fast hiring', value: 'Proposals in hours' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 text-brand-400" />
                <div>
                  <dt className="text-sm font-semibold">{item.label}</dt>
                  <dd className="text-sm text-white/60">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-page mt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Find specialists for every kind of project</h2>
            <p className="mt-2 text-sm text-ink-500">Eight practice areas, one hiring flow.</p>
          </div>
          <ButtonLink href="/talent" variant="outline" size="sm">
            Browse all talent
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/jobs?category=${category.slug}`}
              className="group rounded-2xl border border-ink-100 bg-white p-5 transition-shadow hover:shadow-card"
            >
              <p className="text-sm font-semibold text-ink-950">{category.label}</p>
              <p className="mt-1 text-xs leading-5 text-ink-500">{category.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-700 opacity-0 transition-opacity group-hover:opacity-100">
                Browse roles <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Fresh projects this week</h2>
            <p className="mt-2 text-sm text-ink-500">Posted by teams running their hiring on Taskhaven.</p>
          </div>
          <ButtonLink href="/jobs" variant="outline" size="sm">
            See all jobs
          </ButtonLink>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((job) => (
            <Card key={job.id} className="flex flex-col p-5 transition-shadow hover:shadow-pop">
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>{timeAgo(job.createdAt)}</span>
                <Badge tone={job.budgetType === 'HOURLY' ? 'blue' : 'neutral'}>
                  {job.budgetType === 'HOURLY' ? 'Hourly' : 'Fixed price'}
                </Badge>
              </div>
              <Link href={`/jobs/${job.id}`} className="mt-3 text-base font-semibold leading-6 text-ink-950 hover:text-brand-700">
                {job.title}
              </Link>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-500">{truncate(job.description, 140)}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {job.skills.slice(0, 3).map(({ skill }) => (
                  <span key={skill.id} className="rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium text-ink-700">
                    {skill.name}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-sm font-semibold text-ink-950">
                  {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
                </span>
                <span className="text-xs text-ink-500">{job.proposalCount} proposals</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="grid items-center gap-10 rounded-3xl bg-ink-50 p-8 lg:grid-cols-2 lg:p-14">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Hiring built around outcomes, not hours</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-ink-500">
              Post the work, compare real proposals, then run the contract in one place: milestones, messages and a
              ledger that shows every release. No spreadsheets, no invoice chase.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/jobs/new">Post a job</ButtonLink>
              <ButtonLink href="/how-it-works" variant="outline">
                How it works
              </ButtonLink>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Fund a milestone', body: 'Escrow holds the budget before work starts.', amount: '$2,400' },
              { title: 'Work gets delivered', body: 'The specialist submits, you review.', amount: '$1,600' },
              { title: 'Release on approval', body: 'Net of the platform fee, straight to the ledger.', amount: '$1,440' },
            ].map((step, index) => (
              <div key={step.title} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-950">{step.title}</p>
                  <p className="truncate text-xs text-ink-500">{step.body}</p>
                </div>
                <span className="text-sm font-semibold text-ink-950">{step.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page mt-20">
        <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to start your next project?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Create an account, post a brief, and let the proposals come in. Or browse open work and pitch yourself.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/signup" variant="dark" size="lg">
              Join for free
            </ButtonLink>
            <ButtonLink
              href="/login"
              variant="outline"
              size="lg"
              className="border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              Log in
            </ButtonLink>
          </div>
          <p className="mt-6 text-xs text-white/60">
            Demo data included · simulated escrow · {formatMoney(0)} in real money moves
          </p>
        </div>
      </section>
    </>
  );
}
