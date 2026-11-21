import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';

export const metadata: Metadata = { title: 'How it works' };

const steps = [
  {
    title: 'Post the outcome',
    body: 'Write what needs to exist when the work is done, not a list of hours. Add a budget, a category and the skills involved.',
  },
  {
    title: 'Compare real proposals',
    body: 'Specialists reply with an approach, a price and a delivery window. Shortlist, ask questions, then hire with one click.',
  },
  {
    title: 'Fund a milestone',
    body: 'The budget is recorded in escrow before work starts, so both sides know the money is committed.',
  },
  {
    title: 'Review and release',
    body: 'When the work lands, release the milestone. Taskhaven keeps 10% and the rest is credited to the specialist’s ledger.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">How it works</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Four steps from brief to paid</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          Taskhaven keeps the marketplace loop deliberately small: a brief, proposals, one contract, milestones.
          Everything else is a variation on those four objects, which is why it is easy to self-host and extend.
        </p>

        <ol className="mt-10 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <div>
                <h2 className="text-base font-semibold">{step.title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-500">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-xl font-semibold">What is simulated, and what is real</h2>
        <div className="prose-readable mt-3">
          <p>
            Identity, profiles, jobs, proposals, contracts, milestones, messaging and reviews are real database records.
            Money movement is simulated: the ledger records funding, releases and the platform fee, but no card is
            charged and no payout is made. A payment provider can be added behind the same ledger.
          </p>
          <ul>
            <li>Escrow funding happens when a milestone is created.</li>
            <li>Releases are recorded per milestone, net of a 10% platform fee.</li>
            <li>Reviews unlock once a contract is marked complete.</li>
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href="/jobs/new">Post a job</ButtonLink>
          <ButtonLink href="/jobs" variant="outline">
            Find work
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
