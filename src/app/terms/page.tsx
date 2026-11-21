import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Terms' };

export default function TermsPage() {
  return (
    <SimplePage eyebrow="Legal" title="Terms of use" intro="Plain-language terms for a self-hosted demo build.">
      <p>
        This software is provided as-is under the MIT license, without warranty. If you run a public instance, you are
        the operator and you are responsible for its content, moderation and legal compliance.
      </p>
      <h2>Accounts</h2>
      <p>
        You are responsible for activity under your account and for keeping your credentials private. Operators may
        remove accounts that abuse the service.
      </p>
      <h2>Payments</h2>
      <p>
        This build simulates escrow and payouts. No money is transferred, no invoice is legally issued, and ledger
        entries are not financial records. Connect a licensed payment provider before handling real funds.
      </p>
      <h2>Content</h2>
      <p>
        You keep ownership of what you post. By posting, you grant the instance operator a licence to display it on that
        instance. Do not post content you do not have the rights to.
      </p>
    </SimplePage>
  );
}
