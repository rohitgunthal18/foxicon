/**
 * Shown the instant a navigation starts, replacing the ~1s of frozen page you
 * used to get after clicking. The admin project is hosted in Seoul, so a single
 * query is ~200ms round trip from India — that latency cannot be removed, but
 * it can be made visible instead of looking like a hang.
 */
export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-8" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-primary-100" />
        <div className="h-4 w-72 rounded bg-primary-100" />
      </div>

      <div className="space-y-3">
        <div className="h-4 w-28 rounded bg-primary-100" />
        <div className="divide-y divide-primary-100 overflow-hidden rounded-xl border border-primary-200 bg-white">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-3 px-4 py-4">
              <div className="h-2 w-2 shrink-0 rounded-full bg-primary-100" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-40 rounded bg-primary-100" />
                <div className="h-3 w-56 rounded bg-primary-50" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-primary-200 bg-primary-200 sm:grid-cols-8">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="bg-white px-2 py-5" />
        ))}
      </div>
    </div>
  );
}
