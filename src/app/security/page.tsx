import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Security' };

export default function SecurityPage() {
  return (
    <SimplePage eyebrow="Security" title="Security policy" intro="How to report a vulnerability, and what this build assumes.">
      <h2>Reporting</h2>
      <p>
        Please do not open a public issue for a vulnerability. Send a private report to the maintainers with reproduction
        steps and impact. We aim to acknowledge within a few days and to ship a fix before public disclosure.
      </p>
      <h2>Assumptions in this build</h2>
      <ul>
        <li>Passwords are hashed with bcrypt; sessions are random tokens stored hashed in the database.</li>
        <li>Every mutating server action re-checks the signed-in user and ownership.</li>
        <li>Payments are simulated. No card data is collected or stored anywhere in this codebase.</li>
        <li>Uploaded files are not supported yet, so there is no upload surface to attack.</li>
        <li>Email verification and rate limiting are not implemented yet — add them before public deployment.</li>
      </ul>
      <h2>Before you deploy</h2>
      <ul>
        <li>Serve over HTTPS and set <code>NODE_ENV=production</code> so session cookies are <code>secure</code>.</li>
        <li>Delete the seeded demo accounts and their known password.</li>
        <li>Set a strong <code>APP_SECRET</code> and keep <code>.env</code> out of version control.</li>
        <li>Run behind a reverse proxy with request-size and rate limits.</li>
      </ul>
    </SimplePage>
  );
}
