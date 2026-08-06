/** Board-shaped skeleton, so the columns do not jump in when data lands. */
export default function LeadsLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading leads">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-32 rounded-lg bg-primary-100" />
          <div className="h-4 w-64 rounded bg-primary-100" />
        </div>
        <div className="h-10 w-28 rounded-lg bg-primary-100" />
      </div>

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }, (_, column) => (
          <div
            key={column}
            className="w-72 shrink-0 rounded-xl border border-primary-200 bg-white p-3"
          >
            <div className="mb-3 h-3.5 w-24 rounded bg-primary-100" />
            <div className="space-y-2">
              {Array.from({ length: 2 - (column % 2) }, (_, card) => (
                <div
                  key={card}
                  className="space-y-2 rounded-lg border border-primary-100 p-3"
                >
                  <div className="h-3.5 w-32 rounded bg-primary-100" />
                  <div className="h-3 w-40 rounded bg-primary-50" />
                  <div className="h-3 w-24 rounded bg-primary-50" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
