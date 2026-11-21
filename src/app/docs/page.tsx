import type { Metadata } from 'next';
import { SimplePage } from '@/components/site/simple-page';

export const metadata: Metadata = { title: 'Docs' };

export default function DocsPage() {
  return (
    <SimplePage
      eyebrow="Docs"
      title="Run it locally"
      intro="Three commands get you a seeded marketplace on your machine."
    >
      <h2>Quick start</h2>
      <pre className="overflow-x-auto rounded-xl bg-ink-950 p-4 text-xs leading-6 text-white">
        <code>{`git clone <your fork url> taskhaven
cd taskhaven
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev`}</code>
      </pre>
      <p>
        Open http://localhost:3000 and use the demo accounts on the login screen, or sign up. The seed creates categories,
        skills, jobs, proposals and a contract with a funded milestone.
      </p>
      <h2>Demo accounts</h2>
      <p>
        Every seeded account uses the password <code>password123</code>. Change or delete them before exposing an
        instance to the internet.
      </p>
      <h2>Project layout</h2>
      <ul>
        <li><code>prisma/schema.prisma</code> — the data model</li>
        <li><code>src/lib</code> — auth, money, validation, constants</li>
        <li><code>src/server/actions</code> — server actions (mutations)</li>
        <li><code>src/server/queries.ts</code> — read queries used by pages</li>
        <li><code>src/app</code> — routes</li>
        <li><code>docs/</code> — architecture, payments, roadmap</li>
      </ul>
      <h2>Switching to PostgreSQL</h2>
      <p>
        Change <code>provider = &quot;sqlite&quot;</code> to <code>provider = &quot;postgresql&quot;</code> in the Prisma
        schema, point <code>DATABASE_URL</code> at your database, then run <code>npm run db:push</code>. The schema avoids
        SQLite-only types so the switch needs no model changes.
      </p>
    </SimplePage>
  );
}
