import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Privacy' };

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Legal" title="Privacy" intro="What this application stores, and what it does not.">
      <h2>Stored data</h2>
      <ul>
        <li>Account details you enter: name, email, password hash, profile fields and skills.</li>
        <li>Marketplace activity: jobs, proposals, contracts, milestones, messages, reviews and ledger entries.</li>
        <li>Session records: a hashed token, expiry, and the user agent that created it.</li>
      </ul>
      <h2>Not collected</h2>
      <ul>
        <li>No third-party analytics or advertising scripts ship with this build.</li>
        <li>No card data: payments are simulated.</li>
        <li>No tracking pixels in transactional pages.</li>
      </ul>
      <h2>Your control</h2>
      <p>
        Operators can delete an account and its related records from the database; cascading deletes are configured in
        the Prisma schema. Self-hosted instances are governed by their own operator&apos;s policy.
      </p>
    </SimplePage>
  );
}
