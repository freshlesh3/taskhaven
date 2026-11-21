import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Contributing' };

export default function ContributingPage() {
  return (
    <SimplePage
      eyebrow="Community"
      title="Contributing"
      intro="Bug reports, small fixes and design critique are all welcome."
    >
      <h2>Workflow</h2>
      <ul>
        <li>Open an issue describing the problem before large changes.</li>
        <li>Fork, branch from <code>main</code>, keep pull requests focused.</li>
        <li>Run <code>npm run typecheck</code>, <code>npm test</code> and <code>npm run build</code> before pushing.</li>
        <li>Describe the user-visible change in the pull request, with screenshots for UI work.</li>
      </ul>
      <h2>Code conventions</h2>
      <ul>
        <li>TypeScript strict mode; no <code>any</code> without a comment explaining why.</li>
        <li>Server mutations live in <code>src/server/actions</code> and validate input with Zod.</li>
        <li>Authorisation checks belong in the action, not only in the UI.</li>
        <li>Money is stored in integer minor units; format at the edge.</li>
      </ul>
      <h2>Good first issues</h2>
      <p>
        Documentation fixes, accessibility passes, empty states and test coverage for money and validation helpers are
        always useful and rarely contentious.
      </p>
    </SimplePage>
  );
}
