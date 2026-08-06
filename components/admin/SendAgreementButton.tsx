'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';

import CopyLinkBox from './CopyLinkBox';

interface Props {
  agreementId: string;
  /** Sent agreements get "Resend" — it mints a fresh token and kills the old link. */
  resend?: boolean;
}

export default function SendAgreementButton({ agreementId, resend = false }: Props) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number | null>(null);

  async function handleSend() {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/agreements/${agreementId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(result.error ?? 'Could not send the agreement.');
        return;
      }

      /*
        This is the only time the raw token exists outside the client's browser.
        The database holds only its sha256, so if this modal is dismissed without
        copying, the link is gone for good and a fresh one must be minted. Hence
        the modal rather than a toast — it does not disappear on its own.
      */
      setLink(result.link);
      setExpiresInDays(result.expires_in_days);
      router.refresh();
    } catch {
      setError('Network error. Check your connection and try again.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleSend}
        disabled={isSending}
        className="inline-flex items-center gap-1.5 bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-primary-300"
      >
        {isSending ? (
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        ) : (
          <Send aria-hidden className="h-4 w-4" />
        )}
        {isSending ? 'Sending…' : resend ? 'Resend' : 'Send agreement'}
      </button>

      {error && (
        <p role="alert" className="w-full text-sm text-red-700">
          {error}
        </p>
      )}

      {link && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="send-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4"
        >
          <div className="w-full max-w-lg border border-primary-200 bg-white p-6 shadow-xl">
            <h2
              id="send-modal-title"
              className="font-display text-lg font-bold text-primary-900"
            >
              Copy the signing link now
            </h2>
            <p className="mt-1.5 text-sm text-primary-600">
              This link is shown once and cannot be recovered — we only store a hash
              of it. Send it to your client on WhatsApp or email. If you lose it, hit
              Resend for a fresh one.
            </p>

            <div className="mt-4">
              <CopyLinkBox
                link={link}
                note={
                  expiresInDays
                    ? `Expires in ${expiresInDays} ${expiresInDays === 1 ? 'day' : 'days'}.`
                    : undefined
                }
              />
            </div>

            <button
              type="button"
              onClick={() => setLink(null)}
              className="mt-5 w-full border border-primary-300 px-4 py-2.5 text-sm font-medium text-primary-900 transition hover:border-primary-400"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
