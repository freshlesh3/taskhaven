import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { resendVerificationAction } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Confirm your email' };

type SearchParams = Promise<{ sent?: string; error?: string }>;

const MESSAGES: Record<string, { tone: 'ok' | 'bad'; text: string }> = {
  sent: { tone: 'ok', text: 'A new confirmation link is on its way.' },
  'rate-limited': { tone: 'bad', text: 'You have requested several links already. Try again in an hour.' },
  invalid: { tone: 'bad', text: 'That link was not recognised. Request a fresh one below.' },
  expired: { tone: 'bad', text: 'That link expired. Request a fresh one below.' },
  used: { tone: 'bad', text: 'That link was already used. If you are verified, you can continue.' },
  unverified: { tone: 'bad', text: 'Confirm your email before posting a job or sending a proposal.' },
};

export default async function VerifyNoticePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser('/verify-notice');
  if (user.emailVerifiedAt) redirect('/dashboard?verified=1');

  const { sent, error } = await searchParams;
  const message = sent ? MESSAGES.sent : error ? (MESSAGES[error] ?? MESSAGES.invalid) : null;
  const showDevHint = !process.env.RESEND_API_KEY;

  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">One more step</h1>
        <p className="mt-2 text-sm text-ink-500">
          We sent a confirmation link to <span className="font-medium text-ink-900">{user.email}</span>. Open it to
          finish setting up your account.
        </p>

        {message ? (
          <div
            className={
              message.tone === 'ok'
                ? 'mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900'
                : 'mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'
            }
          >
            {message.text}
          </div>
        ) : null}

        <Card className="mt-8">
          <CardBody className="space-y-4">
            <form action={resendVerificationAction}>
              <Button type="submit" className="w-full">
                Send a new link
              </Button>
            </form>
            <p className="text-center text-xs text-ink-500">
              Links expire after 24 hours and only work once.
            </p>
          </CardBody>
        </Card>

        {showDevHint ? (
          <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-ink-50 p-4 text-xs leading-5 text-ink-500">
            <strong className="text-ink-900">Development mode:</strong> no email provider is configured, so the
            confirmation link is printed to the server console (look for <code>[taskhaven:email]</code>). Set
            <code className="mx-1">RESEND_API_KEY</code> to send real mail.
          </div>
        ) : null}

        <p className="mt-8 text-center text-sm text-ink-500">
          Wrong address?{' '}
          <Link href="/dashboard/settings" className="font-medium text-brand-700 hover:underline">
            Check your settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
