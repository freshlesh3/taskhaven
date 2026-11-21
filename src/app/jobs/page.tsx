import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { CATEGORIES, EXPERIENCE_LABELS, categoryLabel } from '@/lib/constants';
import { listJobs } from '@/server/queries';
import { formatBudget } from '@/lib/money';
import { timeAgo, truncate } from '@/lib/utils';
import { SearchBar } from '@/components/site/search-bar';

export const metadata: Metadata = { title: 'Find work' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q) ?? '';
  const category = first(params.category);
  const budgetType = first(params.budgetType);
  const experience = first(params.experience);
  const page = Number(first(params.page) ?? '1') || 1;

  const { items, total, pages } = await listJobs({ q, category, budgetType, experience, page });

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams();
    const merged = { q, category, budgetType, experience, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    const query = next.toString();
    return query ? `/jobs?${query}` : '/jobs';
  };

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {q ? `Results for “${q}”` : 'Find work that fits'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {total} open {total === 1 ? 'role' : 'roles'}
            {category ? ` in ${categoryLabel(category)}` : ''}
          </p>
        </div>
        <ButtonLink href="/jobs/new">Post a job</ButtonLink>
      </div>

      <div className="mt-6 max-w-2xl">
        <SearchBar defaultValue={q} />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-7">
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Category</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href={buildHref({ category: undefined, page: undefined })}
                  className={!category ? 'font-semibold text-brand-700' : 'text-ink-700 hover:text-ink-950'}
                >
                  All categories
                </Link>
              </li>
              {CATEGORIES.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={buildHref({ category: item.slug, page: undefined })}
                    className={
                      category === item.slug ? 'font-semibold text-brand-700' : 'text-ink-700 hover:text-ink-950'
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Budget</h2>
            <ul className="space-y-1 text-sm">
              {[
                { key: undefined, label: 'Any' },
                { key: 'FIXED', label: 'Fixed price' },
                { key: 'HOURLY', label: 'Hourly' },
              ].map((option) => (
                <li key={option.label}>
                  <Link
                    href={buildHref({ budgetType: option.key, page: undefined })}
                    className={
                      budgetType === option.key ? 'font-semibold text-brand-700' : 'text-ink-700 hover:text-ink-950'
                    }
                  >
                    {option.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Experience</h2>
            <ul className="space-y-1 text-sm">
              {[
                { key: undefined, label: 'Any level' },
                { key: 'ENTRY', label: 'Entry level' },
                { key: 'INTERMEDIATE', label: 'Intermediate' },
                { key: 'EXPERT', label: 'Expert' },
              ].map((option) => (
                <li key={option.label}>
                  <Link
                    href={buildHref({ experience: option.key, page: undefined })}
                    className={
                      experience === option.key ? 'font-semibold text-brand-700' : 'text-ink-700 hover:text-ink-950'
                    }
                  >
                    {option.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-4">
          {items.length === 0 ? (
            <Card className="p-10 text-center">
              <h2 className="text-lg font-semibold">No roles match those filters</h2>
              <p className="mt-2 text-sm text-ink-500">Try a broader search or clear the filters.</p>
              <div className="mt-5">
                <ButtonLink href="/jobs" variant="outline">
                  Clear filters
                </ButtonLink>
              </div>
            </Card>
          ) : (
            items.map((job) => (
              <Card key={job.id} className="p-6 transition-shadow hover:shadow-pop">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/jobs/${job.id}`} className="text-lg font-semibold text-ink-950 hover:text-brand-700">
                      {job.title}
                    </Link>
                    <p className="mt-1 text-xs text-ink-500">
                      {categoryLabel(job.category)} · {job.client.name}
                      {job.client.country ? ` · ${job.client.country}` : ''} · posted {timeAgo(job.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-950">
                      {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
                    </p>
                    <p className="text-xs text-ink-500">{job.proposalCount} proposals</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-ink-700">{truncate(job.description, 260)}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {job.skills.slice(0, 5).map(({ skill }) => (
                    <Badge key={skill.id}>{skill.name}</Badge>
                  ))}
                  <Badge tone="green">{EXPERIENCE_LABELS[job.experience] ?? job.experience}</Badge>
                </div>
              </Card>
            ))
          )}

          {pages > 1 ? (
            <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Pagination">
              {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
                <Link
                  key={number}
                  href={buildHref({ page: String(number) })}
                  className={
                    number === page
                      ? 'flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-sm font-medium text-white'
                      : 'flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 text-sm text-ink-700 hover:bg-ink-50'
                  }
                >
                  {number}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
