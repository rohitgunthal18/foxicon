/** List-shaped skeleton for the agreements page. */
export default function AgreementsLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading agreements">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-7 w-40 bg-primary-100" />
          <div className="h-4 w-64 bg-primary-100" />
        </div>
        <div className="h-10 w-36 bg-primary-100" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-6 w-20 bg-primary-100" />
        ))}
      </div>

      <div className="divide-y divide-primary-100 overflow-hidden border border-primary-200 bg-white">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-28 bg-primary-100" />
              <div className="h-3.5 w-44 bg-primary-100" />
              <div className="h-3 w-36 bg-primary-50" />
            </div>
            <div className="space-y-2 text-right">
              <div className="ml-auto h-3.5 w-20 bg-primary-100" />
              <div className="ml-auto h-3 w-16 bg-primary-50" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
