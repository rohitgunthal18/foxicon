'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail } from 'lucide-react';

const inputBase =
  'w-full rounded-lg border border-primary-200 bg-primary-50 py-2.5 pl-10 pr-3 text-sm text-primary-900 ' +
  'placeholder:text-primary-400 outline-none transition ' +
  'focus:border-primary-950 focus:bg-white focus:ring-0';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? 'Could not sign in. Try again.');
        return;
      }

      // Full refresh so the proxy sees the new auth cookies on the next request.
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-xs font-medium text-primary-700"
        >
          Email
        </label>
        <div className="relative">
          <Mail
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputBase}
            placeholder="you@foxitech.in"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-medium text-primary-700"
        >
          Password
        </label>
        <div className="relative">
          <Lock
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400"
          />
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputBase}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-950 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
