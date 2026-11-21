import { Search } from 'lucide-react';

export function SearchBar({
  compact = false,
  defaultValue = '',
  action = '/jobs',
  placeholder = 'Search jobs, skills or clients',
}: {
  compact?: boolean;
  defaultValue?: string;
  action?: string;
  placeholder?: string;
}) {
  return (
    <form action={action} className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className={
          compact
            ? 'h-10 w-full rounded-full border border-ink-100 bg-ink-50 pl-9 pr-3 text-sm text-ink-950 placeholder:text-ink-500 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20'
            : 'h-14 w-full rounded-full border border-ink-100 bg-white pl-12 pr-4 text-base shadow-card focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20'
        }
      />
    </form>
  );
}
