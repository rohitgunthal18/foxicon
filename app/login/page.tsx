import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import Logo from '@/components/Logo';
import LoginForm from '@/components/admin/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in — FOXI TECH Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin sign-in.
 *
 * Deliberately built from the same vocabulary as the public site: white
 * ground, the left-half dot grid from the hero, the real `Logo` mark, a
 * Space Grotesk display heading and the black primary button. The earlier
 * version was a dark glassmorphic card with a `FOXI.` text wordmark that
 * appears nowhere else in the product, so signing in felt like leaving the
 * brand behind.
 */
export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-5 py-12">
      {/* Same dot grid as the hero, mirrored to both edges and kept faint. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d1d1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-primary-500 transition hover:text-primary-900"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          Back to site
        </Link>

        <div className="mb-7">
          <Logo />
        </div>

        <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.15em] text-primary-500">
          <span aria-hidden className="h-[1px] w-5 bg-primary-400" />
          Admin console
        </span>

        <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-[1.15] tracking-tight text-primary-950">
          Sign in
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-primary-600">
          Manage leads, agreements and reviews.
        </p>

        <div className="mt-7 rounded-2xl border border-primary-200 bg-white p-6 shadow-sm sm:p-7">
          <LoginForm />
        </div>

        <p className="mt-6 text-xs text-primary-400">
          Invite-only. There is no public sign-up, and every session is logged.
        </p>
      </div>
    </main>
  );
}
