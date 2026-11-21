import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">That page is not here</h1>
      <p className="mt-3 max-w-md text-sm text-ink-500">
        The link may be outdated, or the job or profile may have been removed by its owner.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/jobs" variant="outline">
          Browse jobs
        </ButtonLink>
      </div>
      <p className="mt-8 text-xs text-ink-500">
        Looking for something specific?{' '}
        <Link href="/talent" className="font-medium text-brand-700 hover:underline">
          Browse talent
        </Link>
        .
      </p>
    </div>
  );
}
