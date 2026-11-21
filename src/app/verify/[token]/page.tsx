import type { Metadata } from 'next';
import Link from 'next/link';
import { confirmEmailAction } from '@/server/actions/auth';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Confirm your email' };

type Params = Promise<{ token: string }>;

export default async function VerifyPage({ params }: { params: Params }) {
  const { token } = await params;

  return (
    <div className="container-page py-20">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Confirm your email</h1>
        <p className="mt-3 text-sm leading-6 text-ink-500">
          This confirms the address on your Taskhaven account and unlocks posting jobs and sending proposals.
        </p>

        <form action={confirmEmailAction} className="mt-8">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" size="lg" className="w-full">
            Confirm this address
          </Button>
        </form>

        <p className="mt-6 text-xs text-ink-500">
          Links expire after 24 hours and work once. Need a new one?{' '}
          <Link href="/verify-notice" className="font-medium text-brand-700 hover:underline">
            Request another
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
