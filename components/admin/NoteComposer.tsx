'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send } from 'lucide-react';

export default function NoteComposer({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, body: trimmed }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        setError(result.error ?? 'Could not save the note.');
        return;
      }

      setBody('');
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label htmlFor="note-body" className="sr-only">
        Add a note
      </label>
      <textarea
        id="note-body"
        rows={2}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="What happened on the call? Keep the record honest."
        className="w-full resize-none rounded-lg border border-primary-200 px-3 py-2.5 text-sm text-primary-900 outline-none transition placeholder:text-primary-400 focus:border-primary-900"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!body.trim() || isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-primary-300"
        >
          {isSaving ? (
            <Loader2 aria-hidden className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send aria-hidden className="h-3.5 w-3.5" />
          )}
          Add note
        </button>
      </div>
    </form>
  );
}
