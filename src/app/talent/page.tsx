import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Avatar, Badge, Stars } from '@/components/ui/avatar';
import { ButtonLink } from '@/components/ui/button';
import { SearchBar } from '@/components/site/search-bar';
import { countTalent, listTalent } from '@/server/queries';
import { formatRate } from '@/lib/money';
import { truncate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Find talent' };

type SearchParams = Promise<{ q?: string; skill?: string; page?: string }>;

export default async function TalentPage({ searchParams }: { searchParams: SearchParams }) {
  const { q = '', skill, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? '1') || 1);
  const [people, total] = await Promise.all([listTalent({ q, skill, page }), countTalent({ q, skill })]);
  const pages = Math.max(1, Math.ceil(total / 12));

  const skillChips = Array.from(
    new Map(
      people.flatMap((person) => person.skills.map((entry) => [entry.skill.slug, entry.skill.name])),
    ).entries(),
  ).slice(0, 12);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Find your next specialist</h1>
          <p className="mt-2 text-sm text-ink-500">{total} independent professionals ready to work.</p>
        </div>
        <ButtonLink href="/jobs/new">Post a job instead</ButtonLink>
      </div>

      <div className="mt-6 max-w-2xl">
        <SearchBar action="/talent" placeholder="Search by name, skill or headline" defaultValue={q} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/talent"
          className={
            !skill
              ? 'rounded-full bg-ink-950 px-3 py-1.5 text-xs font-medium text-white'
              : 'rounded-full border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50'
          }
        >
          All skills
        </Link>
        {skillChips.map(([slug, name]) => (
          <Link
            key={slug}
            href={`/talent?skill=${slug}`}
            className={
              skill === slug
                ? 'rounded-full bg-ink-950 px-3 py-1.5 text-xs font-medium text-white'
                : 'rounded-full border border-ink-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50'
            }
          >
            {name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => {
          const ratings = person.reviewsReceived.map((review) => review.rating);
          const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
          return (
            <Card key={person.id} className="flex flex-col p-5 transition-shadow hover:shadow-pop">
              <div className="flex items-start gap-3">
                <Avatar name={person.name} hue={person.avatarHue} size={48} />
                <div className="min-w-0 flex-1">
                  <Link href={`/talent/${person.handle}`} className="block truncate text-sm font-semibold hover:text-brand-700">
                    {person.name}
                  </Link>
                  <p className="truncate text-xs text-ink-500">{person.headline ?? 'Independent specialist'}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
                    {ratings.length ? (
                      <>
                        <Stars rating={average} />
                        <span>
                          {average.toFixed(1)} ({ratings.length})
                        </span>
                      </>
                    ) : (
                      <span>New to Taskhaven</span>
                    )}
                  </div>
                </div>
              </div>

              <p className="mt-3 line-clamp-3 text-xs leading-5 text-ink-500">
                {truncate(person.bio ?? 'No bio yet.', 150)}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {person.skills.slice(0, 4).map((entry) => (
                  <Badge key={entry.skill.id}>{entry.skill.name}</Badge>
                ))}
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-4">
                <span className="text-sm font-semibold">{formatRate(person.hourlyRate)}</span>
                <span className="text-xs text-ink-500">
                  {person.contractsWork.length} completed · {person.country ?? 'Remote'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {people.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <h2 className="text-lg font-semibold">No one matches yet</h2>
          <p className="mt-2 text-sm text-ink-500">Try a different skill, or post a job and let people come to you.</p>
        </Card>
      ) : null}

      {pages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pages }, (_, index) => index + 1).map((number) => {
            const params = new URLSearchParams();
            if (q) params.set('q', q);
            if (skill) params.set('skill', skill);
            if (number > 1) params.set('page', String(number));
            const query = params.toString();
            return (
              <Link
                key={number}
                href={query ? `/talent?${query}` : '/talent'}
                className={
                  number === page
                    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-ink-950 text-sm font-medium text-white'
                    : 'flex h-9 w-9 items-center justify-center rounded-full border border-ink-100 text-sm text-ink-700 hover:bg-ink-50'
                }
              >
                {number}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
