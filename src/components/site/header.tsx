import Link from 'next/link';
import type { User } from '@prisma/client';
import { Bell } from 'lucide-react';
import { logoutAction } from '@/server/actions/auth';
import { Logo } from './logo';
import { Avatar } from '@/components/ui/avatar';
import { buttonClasses } from '@/components/ui/button';
import { SearchBar } from './search-bar';

const nav = [
  { href: '/jobs', label: 'Find work' },
  { href: '/talent', label: 'Talent' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/pricing', label: 'Pricing' },
];

export function Header({ user, unreadCount = 0 }: { user: User | null; unreadCount?: number }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-page items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-5 text-sm font-medium text-ink-700 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-ink-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs md:block">
          <SearchBar compact />
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {user ? (
            <>
              <Link href="/notifications" className="relative rounded-full p-2 hover:bg-ink-50" aria-label="Notifications">
                <Bell className="h-5 w-5 text-ink-700" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                ) : null}
              </Link>
              <Link href="/dashboard" className={buttonClasses('ghost', 'sm')}>
                Dashboard
              </Link>
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-1 hover:bg-ink-50">
                  <Avatar name={user.name} hue={user.avatarHue} size={34} />
                </summary>
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-pop">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-ink-950">{user.name}</p>
                    <p className="truncate text-xs text-ink-500">{user.email}</p>
                  </div>
                  <div className="my-1 h-px bg-ink-100" />
                  <Link href={`/talent/${user.handle}`} className="block px-3 py-2 text-sm hover:bg-ink-50">
                    View profile
                  </Link>
                  <Link href="/dashboard/profile" className="block px-3 py-2 text-sm hover:bg-ink-50">
                    Edit profile
                  </Link>
                  <Link href="/dashboard/settings" className="block px-3 py-2 text-sm hover:bg-ink-50">
                    Settings
                  </Link>
                  {user.role === 'ADMIN' ? (
                    <Link href="/admin" className="block px-3 py-2 text-sm hover:bg-ink-50">
                      Admin
                    </Link>
                  ) : null}
                  <div className="my-1 h-px bg-ink-100" />
                  <form action={logoutAction}>
                    <button type="submit" className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Log out
                    </button>
                  </form>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClasses('ghost', 'sm')}>
                Log in
              </Link>
              <Link href="/signup" className={buttonClasses('primary', 'sm')}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-ink-100 px-4 py-2 md:hidden">
        <SearchBar compact />
      </div>
    </header>
  );
}
