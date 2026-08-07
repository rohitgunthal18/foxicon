'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileSignature,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

import Logo from '@/components/Logo';

/**
 * Only routes that exist.
 *
 * Reviews and Settings were listed here before either page was built, so two of
 * the five sidebar items 404'd. They go back in when there is something to open.
 */
const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/agreements', label: 'Agreements', icon: FileSignature },
];

interface Props {
  adminName: string;
  adminRole: string;
  children: React.ReactNode;
}

export default function AdminShell({ adminName, adminRole, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function signOut() {
    await fetch('/api/admin/session', { method: 'DELETE' });
    router.replace('/login');
    router.refresh();
  }

  const initials = adminName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  const navLinks = (
    <nav className="space-y-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setIsNavOpen(false)}
          aria-current={isActive(href, exact) ? 'page' : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
            isActive(href, exact)
              ? 'bg-accent-500 font-medium text-white'
              : 'text-white/60 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Icon aria-hidden className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    /*
      The shell owns the viewport, and `main` is the only thing that scrolls.

      This used to be `min-h-screen` with the document scrolling, which meant no
      child could ask for "the rest of the screen" without guessing at the height
      of everything above it. The leads table did guess — `max-h-[62dvh]`, then a
      `lg:` override with a hand-counted `calc()` — and it was wrong at every
      width in between, capping the table two-thirds down the screen and leaving
      a third of the page empty underneath it.

      With a definite height here, `min-h-full` on the content box below gives
      pages a real 100% to divide up, and the table can just say `flex-1`.
    */
    <div className="flex h-dvh flex-col overflow-hidden bg-primary-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-primary-900 p-4 lg:flex">
        {/* The real brand mark, inverted for the dark rail — not a text stand-in. */}
        <Link href="/admin" className="mb-8 block px-3 pt-2">
          <Logo invert />
          <span className="mt-1.5 block text-[10px] uppercase tracking-widest text-white/40">
            Admin
          </span>
        </Link>

        {navLinks}

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 text-xs font-semibold text-white">
              {initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-white">{adminName}</span>
              <span className="block text-xs capitalize text-white/40">{adminRole}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar. A flex row of the column rather than `sticky`, now that
          the scrolling happens in `main` — it stays put by construction. */}
      <header className="z-40 flex shrink-0 items-center justify-between border-b border-primary-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="flex items-center">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setIsNavOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-primary-700 transition hover:bg-primary-100"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {isNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsNavOpen(false)}
            className="absolute inset-0 bg-primary-950/50"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-primary-900 p-4">
            <div className="mb-8 flex items-center justify-between px-3 pt-2">
              <Logo invert />
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {navLinks}

            <div className="mt-auto border-t border-white/10 pt-4">
              <div className="px-3 py-2">
                <span className="block truncate text-sm text-white">{adminName}</span>
                <span className="block text-xs capitalize text-white/40">{adminRole}</span>
              </div>
              <button
                type="button"
                onClick={signOut}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <LogOut aria-hidden className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-0 flex-1 overflow-y-auto lg:pl-60">
        {/*
          `max-w-6xl` capped content at 72rem, which on a wide screen left the
          leads table scrolling sideways inside a box with empty page either side
          of it — the table needs the width more than the reading measure does.
          `7xl` gives it back without letting prose run edge to edge on an
          ultrawide. Vertical padding is `py-5` rather than `lg:py-10` for the
          same reason: 80px of it was pushing the table toward the fold.

          `min-h-full` is what closes the flex chain: `main` has a definite height,
          so 100% here is a real number, and a page that says `flex-1` gets the
          remainder instead of falling back to its content height. Without it the
          leads table's `flex-1` resolved to nothing, the table grew to fit all
          twenty rows, and you got two vertical scrollbars — the table's own and
          `main`'s underneath it.

          `min-` rather than `h-`: a page taller than the viewport (a long
          dashboard) still grows and scrolls in `main`, exactly as before.
        */}
        <div className="mx-auto flex min-h-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
