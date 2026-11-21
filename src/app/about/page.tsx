import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <SimplePage
      eyebrow="About"
      title="A marketplace you can actually run"
      intro="Taskhaven is an open-source take on the freelance marketplace: the full hiring loop, no lock-in, and code you can read."
    >
      <p>
        Most marketplace software is either a closed SaaS product or a thin directory. Taskhaven sits in between: it is a
        real application — accounts, jobs, proposals, contracts, milestones, messages, reviews and a ledger — with no
        proprietary dependency in the critical path.
      </p>
      <h2>Why open source</h2>
      <p>
        Hiring infrastructure shapes who gets work. Making the software auditable and forkable lets communities,
        agencies and cooperatives run their own marketplaces with their own rules, fees and moderation.
      </p>
      <h2>Not affiliated with Upwork</h2>
      <p>
        Taskhaven is an independent project. It is inspired by the category, not copied from any proprietary source: all
        code, copy and branding here are original, and the design language is our own. Product names and logos of other
        companies belong to their owners.
      </p>
      <h2>Status</h2>
      <p>
        Early but usable. The core loop works end to end on a single instance. Multi-tenant organisations, real payment
        rails, file attachments and email delivery are tracked in the repository roadmap.
      </p>
    </SimplePage>
  );
}
