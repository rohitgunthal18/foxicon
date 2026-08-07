'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react';

export interface SettingField {
  key: string;
  label: string;
  /** True when the stored value is a secret — sent masked, never in full. */
  secret: boolean;
  /** What is stored in the database, masked if secret. Empty when unset. */
  value: string;
  /** The env var this key falls back to, and whether that env var is set. */
  envFallback: string | null;
  envIsSet: boolean;
  placeholder?: string;
  hint?: string;
}

interface Props {
  fields: SettingField[];
}

/**
 * Sarvam credentials, editable in one form.
 *
 * A secret's real value is never sent to the browser — the server sends a mask
 * and this form sends back only the fields you actually retyped. Leaving a
 * secret untouched leaves it untouched in the database; clearing it on purpose
 * is what hands the credential back to the environment variable.
 */
export default function SarvamSettingsForm({ fields }: Props) {
  const router = useRouter();
  /** Only keys present here are sent. A field you never touch is never written. */
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const dirty = Object.keys(edits).length > 0;

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;

    setStatus('saving');
    setMessage('');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: Object.entries(edits).map(([key, value]) => ({ key, value })),
        }),
      });
      const result = await response.json().catch(() => ({}) as { error?: string });

      if (!response.ok) {
        setStatus('error');
        setMessage(result.error ?? 'Could not save.');
        return;
      }

      setStatus('saved');
      setEdits({});
      setRevealed({});
      // Re-read from the server so the masks reflect what is actually stored.
      router.refresh();
    } catch {
      setStatus('error');
      setMessage('Could not reach the server.');
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      {fields.map((field) => {
        const isEdited = field.key in edits;
        const shown = isEdited ? edits[field.key] : field.value;
        const isRevealed = revealed[field.key] ?? false;
        const isStored = field.value.length > 0;

        return (
          <div key={field.key}>
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor={`setting-${field.key}`}
                className="text-xs font-medium text-primary-700"
              >
                {field.label}
              </label>
              {/*
                Where the value in force actually comes from. Without this you
                cannot tell a saved credential from one the environment is
                quietly supplying, and "why is it still calling the old account"
                becomes unanswerable.
              */}
              <span className="text-[11px] text-primary-500">
                {isStored ? (
                  'Saved here'
                ) : field.envIsSet ? (
                  <>
                    From <code className="text-primary-600">{field.envFallback}</code>
                  </>
                ) : (
                  <span className="text-amber-700">Not set</span>
                )}
              </span>
            </div>

            <div className="relative mt-1">
              <input
                id={`setting-${field.key}`}
                type={field.secret && !isRevealed ? 'password' : 'text'}
                value={shown}
                placeholder={field.placeholder}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) =>
                  setEdits((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                onFocus={() => {
                  // A masked value is not the real one, so editing it would
                  // save the mask. Clear it on first focus instead.
                  if (field.secret && !isEdited) {
                    setEdits((prev) => ({ ...prev, [field.key]: '' }));
                  }
                }}
                className={`w-full rounded-lg border bg-white py-2 pl-3 text-sm text-primary-900 outline-none transition focus:border-primary-950 ${
                  field.secret ? 'pr-10' : 'pr-3'
                } ${isEdited ? 'border-accent-500' : 'border-primary-200'}`}
              />
              {field.secret && (
                <button
                  type="button"
                  onClick={() =>
                    setRevealed((prev) => ({ ...prev, [field.key]: !isRevealed }))
                  }
                  aria-label={isRevealed ? 'Hide' : 'Show'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-primary-400 transition hover:text-primary-900"
                >
                  {isRevealed ? (
                    <EyeOff aria-hidden className="h-3.5 w-3.5" />
                  ) : (
                    <Eye aria-hidden className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {field.hint && (
              <p className="mt-1 text-[11px] text-primary-500">{field.hint}</p>
            )}
          </div>
        );
      })}

      {status === 'error' && message && (
        <p
          aria-live="polite"
          className="rounded-lg border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {message}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-primary-200 pt-4">
        <button
          type="submit"
          disabled={!dirty || status === 'saving'}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary-950"
        >
          {status === 'saving' && (
            <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
          )}
          {status === 'saving' ? 'Saving…' : 'Save credentials'}
        </button>

        {dirty && (
          <button
            type="button"
            onClick={() => {
              setEdits({});
              setRevealed({});
              setStatus('idle');
            }}
            className="text-sm text-primary-600 transition hover:text-primary-900"
          >
            Discard
          </button>
        )}

        {status === 'saved' && !dirty && (
          <p
            aria-live="polite"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"
          >
            <Check aria-hidden className="h-3.5 w-3.5" />
            Saved
          </p>
        )}
      </div>
    </form>
  );
}
