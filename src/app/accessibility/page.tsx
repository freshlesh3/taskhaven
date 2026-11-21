import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Accessibility' };

export default function AccessibilityPage() {
  return (
    <SimplePage
      eyebrow="Accessibility"
      title="Accessibility statement"
      intro="What we aim for, what works today, and what is still rough."
    >
      <h2>Target</h2>
      <p>
        WCAG 2.2 AA. The interface is built with semantic HTML, labelled form controls, a visible focus ring on every
        interactive element, and colour pairs chosen to meet contrast requirements for body text.
      </p>
      <h2>Known gaps</h2>
      <ul>
        <li>Some icon-only controls rely on adjacent text for context.</li>
        <li>Keyboard focus management inside the account menu is basic.</li>
        <li>No formal audit has been run against the full page set yet.</li>
      </ul>
      <h2>Helping</h2>
      <p>
        Accessibility fixes are a good first contribution. Open an issue with the page, the assistive technology you
        used, and what happened instead of what you expected.
      </p>
    </SimplePage>
  );
}
