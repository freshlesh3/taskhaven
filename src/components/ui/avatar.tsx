import { cn, initials } from '@/lib/utils';

export function Avatar({
  name,
  hue = 150,
  size = 40,
  className,
}: {
  name: string;
  hue?: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, size * 0.36),
        background: `linear-gradient(135deg, hsl(${hue} 62% 42%), hsl(${hue + 24} 58% 30%))`,
      }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'green' | 'amber' | 'blue' | 'red';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-ink-100 text-ink-700',
    green: 'bg-brand-50 text-brand-800',
    amber: 'bg-amber-50 text-amber-800',
    blue: 'bg-sky-50 text-sky-800',
    red: 'bg-red-50 text-red-700',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-brand-700', className)} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4">
          <path d="M10 1.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}
