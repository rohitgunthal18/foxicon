'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  link: string;
  /** Small line under the field — usually the expiry. */
  note?: string;
}

/**
 * A read-only link with a copy button.
 *
 * Used only where a signing link is genuinely available: right after minting
 * one. The link cannot be shown again later — the database stores only its
 * sha256 — so there is no version of this box that reads a link out of a row.
 */
export default function CopyLinkBox({ link, note }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard is blocked on insecure origins and in some browsers. The
      // input is selectable, so the manual path still works.
      setCopied(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={link}
          readOnly
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 border border-primary-200 bg-primary-50 px-3 py-2 font-mono text-xs text-primary-900"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex shrink-0 items-center gap-1.5 border border-primary-300 bg-white px-3 py-2 text-sm font-medium text-primary-900 transition hover:border-primary-400"
        >
          {copied ? (
            <>
              <Check aria-hidden className="h-4 w-4 text-green-600" />
              Copied
            </>
          ) : (
            <>
              <Copy aria-hidden className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>
      {note && <p className="mt-2 text-xs text-primary-500">{note}</p>}
    </div>
  );
}
