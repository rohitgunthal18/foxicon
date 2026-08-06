'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

import { parseCsv, mapRow, detectColumns, type MappedRow } from '@/lib/csv';

interface ImportPreview {
  fileName: string;
  rowCount: number;
  mapping: Record<string, string | null>;
  rows: MappedRow[];
}

export default function ImportLeadsForm() {
  const router = useRouter();
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    inserted: number;
    skipped: number;
    degraded?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.csv$/i)) {
      setError('Only CSV files are supported.');
      return;
    }

    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, rows } = parseCsv(text);

        if (rows.length === 0) {
          setError('The file is empty or contains no data rows.');
          return;
        }

        if (rows.length > 2000) {
          setError(`The file has ${rows.length} rows. Max 2000 per import.`);
          return;
        }

        const mapping = detectColumns(headers);
        const mapped = rows.map(mapRow);

        // Warn about missing critical fields early.
        const missingName = mapped.findIndex((r) => !r.name);
        if (missingName !== -1) {
          setError(
            `Row ${missingName + 1} has no name. Every lead needs one.`
          );
          return;
        }

        const unreachable = mapped.findIndex(
          (r) => !r.email && !r.phone && !r.maps_url
        );
        if (unreachable !== -1) {
          setError(
            `Row ${unreachable + 1} (${mapped[unreachable].name}) has no phone, email, or Maps link—there would be no way to contact them.`
          );
          return;
        }

        setPreview({
          fileName: file.name,
          rowCount: rows.length,
          mapping,
          rows: mapped,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not read the file. Make sure it is a valid CSV.'
        );
      }
    };

    reader.readAsText(file, 'utf-8');
  }

  async function handleImport() {
    if (!preview) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: preview.rows }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Import failed.');
        return;
      }

      setResult({
        inserted: data.inserted,
        skipped: data.skipped,
        degraded: data.degraded,
      });

      /**
       * Wait a beat for the user to read the success message before
       * redirecting — but when the import fell back to application-level
       * de-duplication, stay put. That notice names a one-time SQL fix, and
       * bouncing to the leads list after 1.5s would scroll it out of existence.
       */
      if (!data.degraded) {
        setTimeout(() => {
          router.push('/admin/leads');
          router.refresh();
        }, 1500);
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {!preview && (
        <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
          <header className="border-b border-primary-200 bg-primary-50/50 px-5 py-3">
            <h2 className="text-sm font-semibold text-primary-900">
              Select a CSV file
            </h2>
          </header>

          <div className="p-6">
            <p className="mb-4 text-sm text-primary-600">
              Expected columns: <strong>name</strong>, <strong>phone</strong>,{' '}
              <strong>city</strong>, <strong>lead_score</strong>,{' '}
              <strong>rating</strong>, <strong>reviews</strong>,{' '}
              <strong>maps_url</strong>, and others. Column names are flexible —
              <code>reviews</code> and <code>review_count</code> both work,{' '}
              <code>maps</code> and <code>google_maps</code> both work.
            </p>

            <label
              htmlFor="csv-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-primary-300 bg-primary-50/30 py-12 transition hover:border-primary-400 hover:bg-primary-50"
            >
              <Upload className="mb-3 h-10 w-10 text-primary-400" />
              <span className="text-sm font-medium text-primary-700">
                Click to choose a file
              </span>
              <span className="mt-1 text-xs text-primary-500">
                CSV, up to 2000 rows
              </span>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFile}
                className="sr-only"
              />
            </label>
          </div>
        </section>
      )}

      {preview && !result && (
        <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
          <header className="flex items-center justify-between border-b border-primary-200 bg-primary-50/50 px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold text-primary-900">
                {preview.fileName}
              </h2>
              <p className="text-xs text-primary-600">
                {preview.rowCount} rows ready to import
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="rounded p-1 text-primary-500 transition hover:bg-primary-100 hover:text-primary-900"
              aria-label="Cancel"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="p-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-700">
              Column mapping
            </h3>
            <div className="mb-5 grid gap-2 text-xs sm:grid-cols-2">
              {Object.entries(preview.mapping).map(([field, col]) => (
                <div
                  key={field}
                  className="flex items-center justify-between rounded border border-primary-200 bg-primary-50/30 px-3 py-2"
                >
                  <span className="font-medium text-primary-700">{field}</span>
                  <span className="text-primary-500">
                    {col ? `← ${col}` : '(not in file)'}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-700">
              Preview (first 5 rows)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-primary-200 text-left">
                    <th className="px-2 py-2 font-semibold text-primary-700">Name</th>
                    <th className="px-2 py-2 font-semibold text-primary-700">Phone</th>
                    <th className="px-2 py-2 font-semibold text-primary-700">City</th>
                    <th className="px-2 py-2 font-semibold text-primary-700">Score</th>
                    <th className="px-2 py-2 font-semibold text-primary-700">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {preview.rows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="px-2 py-2 text-primary-900">{row.name}</td>
                      <td className="px-2 py-2 text-primary-600">
                        {row.phone || '—'}
                      </td>
                      <td className="px-2 py-2 text-primary-600">
                        {row.city || '—'}
                      </td>
                      <td className="px-2 py-2 text-primary-600">
                        {row.lead_score || '—'}
                      </td>
                      <td className="px-2 py-2 text-primary-600">
                        {row.rating || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {preview.rowCount > 5 && (
              <p className="mt-2 text-xs text-primary-500">
                … and {preview.rowCount - 5} more rows.
              </p>
            )}
          </div>

          <footer className="border-t border-primary-200 bg-primary-50/30 px-5 py-4">
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing && <Loader2 className="h-4 w-4 animate-spin" />}
              {importing ? 'Importing…' : `Import ${preview.rowCount} leads`}
            </button>
          </footer>
        </section>
      )}

      {result && (
        <section className="overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-50">
          <div className="flex items-start gap-3 p-5">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-emerald-900">
                Import complete
              </h3>
              <p className="mt-1 text-sm text-emerald-700">
                {result.inserted} leads added.
                {result.skipped > 0 &&
                  ` ${result.skipped} duplicates were skipped (their Maps URLs were already in the system).`}
              </p>
              {result.degraded ? (
                <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-50 p-3">
                  <p className="text-xs font-semibold text-amber-900">
                    One thing to fix when you get a chance
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    The <code className="font-mono">maps_url</code> unique index
                    is missing, so duplicates were filtered in application code
                    instead of by the database. Your leads imported correctly.
                    Run{' '}
                    <code className="font-mono">
                      supabase/APPLY_MAPS_URL_FIX.sql
                    </code>{' '}
                    in the Supabase SQL editor to restore the faster, atomic
                    path.
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-xs text-emerald-600">
                  Redirecting to the leads list…
                </p>
              )}

              {result.degraded && (
                <Link
                  href="/admin/leads"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 underline transition hover:text-emerald-950"
                >
                  Go to the leads list
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {error && (
        <section
          role="alert"
          className="overflow-hidden rounded-xl border border-red-500/20 bg-red-50"
        >
          <div className="flex items-start gap-3 p-5">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-red-900">Import failed</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center gap-3">
        <Link
          href="/admin/leads"
          className="text-sm text-primary-500 transition hover:text-primary-900"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}
