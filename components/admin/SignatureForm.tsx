'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Download, Loader2, MessageCircle, PenLine } from 'lucide-react';

interface Props {
  token: string;
  contentHash: string;
  signingText: string;
  defaultName: string;
  defaultEmail: string;
}

export default function SignatureForm({
  token,
  contentHash,
  signingText,
  defaultName,
  defaultEmail,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedName, setSignedName] = useState<string | null>(null);

  const canSubmit = accepted && name.trim().length >= 2 && !isSubmitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signer_name: name.trim(),
          signer_email: email.trim(),
          accepted_terms: true,
          content_hash: contentHash,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not submit. Please try again.');
        return;
      }

      /*
        Show the confirmation from local state first, then refresh. The refresh
        re-renders the server component into the signed copy, but it is a round
        trip — leaving the button spinning through it reads as "did that work?"
        on the one interaction where the client needs certainty.
      */
      setSignedName(name.trim());
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (signedName) {
    return (
      <div className="space-y-5 text-center">
        <div>
          <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-3 font-display text-xl font-bold text-primary-900">
            Signed. Thank you, {signedName}.
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-600">
            The agreement is now executed. Keep a copy for your records.
          </p>
        </div>

        <a
          href={`/api/sign/${token}/pdf`}
          className="inline-flex items-center justify-center gap-2 bg-primary-900 px-6 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-accent-600"
        >
          <Download aria-hidden className="h-4 w-4" />
          Download your copy
        </a>

        <p className="flex items-center justify-center gap-2 text-sm text-primary-600">
          <MessageCircle aria-hidden className="h-4 w-4 shrink-0 text-primary-400" />
          We&apos;ll also send your signed copy over WhatsApp shortly.
        </p>

        <p className="text-[11px] text-primary-400">
          This page stays available if you need to download the agreement again.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <h2 className="font-display text-lg font-bold text-primary-900">Sign this agreement</h2>
        <p className="mt-1 text-sm text-primary-600">
          Type your full legal name exactly as you would sign it.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="signer-name"
            className="mb-1.5 block text-xs font-medium text-primary-700"
          >
            Full legal name
          </label>
          <div className="relative">
            <PenLine
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-300"
            />
            <input
              id="signer-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="w-full border border-primary-300 py-2.5 pl-10 pr-3 font-display text-base text-primary-900 outline-none transition focus:border-primary-900"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="signer-email"
            className="mb-1.5 block text-xs font-medium text-primary-700"
          >
            Email <span className="text-primary-400">(optional)</span>
          </label>
          <input
            id="signer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="w-full border border-primary-300 px-3 py-2.5 text-sm text-primary-900 outline-none transition focus:border-primary-900"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 border border-primary-200 bg-primary-50 p-4">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent-500"
        />
        <span className="text-sm leading-relaxed text-primary-700">{signingText}</span>
      </label>

      {error && (
        <p role="alert" className="bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 bg-primary-900 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-primary-300"
      >
        {isSubmitting && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Signing…' : 'Sign and accept'}
      </button>

      <p className="text-center text-[11px] text-primary-400">
        Your name, the time, and your device details are recorded as proof of
        signature. You can only sign once.
      </p>
    </form>
  );
}
