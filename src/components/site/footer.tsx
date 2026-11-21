import Link from 'next/link';

const columns = [
  {
    title: 'For clients',
    links: [
      { href: '/jobs/new', label: 'Post a job' },
      { href: '/talent', label: 'Find talent' },
      { href: '/how-it-works', label: 'How it works' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'For freelancers',
    links: [
      { href: '/jobs', label: 'Find work' },
      { href: '/signup', label: 'Create a profile' },
      { href: '/how-it-works', label: 'Getting paid' },
      { href: '/pricing', label: 'Fees' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/docs', label: 'Docs' },
      { href: '/api/health', label: 'Status' },
      { href: '/about', label: 'About' },
    ],
  },
  {
    title: 'Open source',
    links: [
      { href: '/license', label: 'MIT License' },
      { href: '/contributing', label: 'Contributing' },
      { href: '/security', label: 'Security' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-3 text-sm font-semibold text-ink-950">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-sm text-ink-500 transition-colors hover:text-ink-950">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-ink-100 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Taskhaven contributors. Open source under the MIT license. Not affiliated with
            Upwork.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-ink-950">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-ink-950">
              Privacy
            </Link>
            <Link href="/accessibility" className="hover:text-ink-950">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
