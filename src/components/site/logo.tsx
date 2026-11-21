import Link from 'next/link';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline gap-0.5 text-[26px] font-semibold tracking-[-0.04em] text-ink-950 ${className}`}>
      taskhaven
      <span className="mb-0.5 inline-block h-2 w-2 rounded-full bg-brand-600" aria-hidden="true" />
    </Link>
  );
}
