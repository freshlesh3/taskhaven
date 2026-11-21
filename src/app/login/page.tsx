import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/forms/login-form';
import { demoLoginAction } from '@/server/actions/auth';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export const metadata: Metadata = { title: 'Log in' };

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (user) redirect('/dashboard');

  const { next } = await searchParams;
  const demoUsers = await db.user.findMany({ orderBy: { createdAt: 'asc' }, take: 2, select: { name: true, email: true, role: true, avatarHue: true } });

  return (
    <div className="container-page py-16">
      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Log in to Taskhaven</h1>
          <p className="mt-2 text-sm text-ink-500">
            Pick up where you left off: proposals, contracts and messages live in one dashboard.
          </p>

          <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
            <LoginForm next={next} />
          </div>
        </div>

        <aside className="rounded-2xl bg-ink-50 p-6">
          <h2 className="text-sm font-semibold text-ink-950">Try a demo account</h2>
          <p className="mt-1 text-xs leading-5 text-ink-500">
            The seed script creates two accounts with sample jobs, proposals and a live contract. One click signs you in.
          </p>

          <ul className="mt-4 space-y-2">
            {demoUsers.map((demo) => (
              <li key={demo.email}>
                <form action={demoLoginAction}>
                  <input type="hidden" name="email" value={demo.email} />
                  <button
                    type="submit"
                    className="flex w-full items-center gap-3 rounded-xl border border-ink-100 bg-white p-3 text-left transition-shadow hover:shadow-card"
                  >
                    <Avatar name={demo.name} hue={demo.avatarHue} size={36} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink-950">{demo.name}</span>
                      <span className="block truncate text-xs text-ink-500">
                        {demo.role === 'CLIENT' ? 'Client' : 'Freelancer'} · {demo.email}
                      </span>
                    </span>
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl bg-white p-4 text-xs leading-5 text-ink-500">
            Seed passwords are <code className="rounded bg-ink-100 px-1 py-0.5 font-mono">password123</code> for every demo
            account. Change them before exposing an instance to the internet.
          </div>

          <p className="mt-6 text-xs text-ink-500">
            No account?{' '}
            <Link href="/signup" className="font-medium text-brand-700 hover:underline">
              Create one
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
