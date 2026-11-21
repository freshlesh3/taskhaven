import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';

export const metadata: Metadata = { title: 'Pricing' };

const plans = [
  {
    name: 'Starter',
    price: '5%',
    tagline: 'For the first few projects',
    body: 'Everything you need to hire and get paid.',
    features: [
      'Post and manage jobs',
      'Unlimited proposals',
      'Milestones and simulated escrow',
      'Contract messaging',
      'Reviews after completion',
    ],
    cta: { label: 'Get started free', href: '/signup' },
  },
  {
    name: 'Team Plus',
    price: '8%',
    tagline: 'For repeat hiring',
    body: 'Lower risk on bigger engagements, plus team tooling.',
    features: [
      'Everything in Starter',
      'Priority placement on proposals',
      'Team workspace with roles',
      'Consolidated monthly reporting',
      'Priority support',
    ],
    cta: { label: 'Talk to us', href: '/about' },
    popular: true,
  },
];

export default function PricingPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">Pricing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pay for outcomes, not seats</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          No subscription, no listing fee. Taskhaven takes a percentage when a milestone is released. Self-hosting the
          open-source build is free forever.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.popular ? 'border-2 border-brand-600 p-6' : 'p-6'}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{plan.name}</h2>
              {plan.popular ? <Badge tone="green">Popular</Badge> : null}
            </div>
            <p className="mt-1 text-xs text-ink-500">{plan.tagline}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight">{plan.price}</p>
            <p className="text-xs text-ink-500">per released milestone</p>
            <p className="mt-4 text-sm text-ink-700">{plan.body}</p>
            <ul className="mt-5 space-y-2 text-sm text-ink-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <ButtonLink href={plan.cta.href} variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                {plan.cta.label}
              </ButtonLink>
            </div>
          </Card>
        ))}
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-ink-500">
        Fees are configured in <code className="rounded bg-ink-100 px-1 py-0.5 font-mono">src/lib/money.ts</code>. Change
        them, or set them to zero, on your own instance.
      </p>
    </div>
  );
}
