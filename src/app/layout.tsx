import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Header } from '@/components/site/header';
import { Footer } from '@/components/site/footer';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: {
    default: 'Taskhaven — hire skilled independent specialists',
    template: '%s · Taskhaven',
  },
  description:
    'Taskhaven is an open-source freelance marketplace: post work, compare proposals, run contracts with milestones and simulated escrow.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Taskhaven — hire skilled independent specialists',
    description: 'An open-source freelance marketplace you can self-host.',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = user
    ? await db.notification.count({ where: { userId: user.id, readAt: null } })
    : 0;

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Header user={user} unreadCount={unreadCount} />
        {user && !user.emailVerifiedAt ? (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
            Confirm your email to post jobs and send proposals.{' '}
            <Link href="/verify-notice" className="font-semibold underline">
              Resend the link
            </Link>
          </div>
        ) : null}
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
