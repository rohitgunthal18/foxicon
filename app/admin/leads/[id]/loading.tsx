/** Detail-shaped skeleton for a single lead. */
export default function LeadDetailLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading lead">
      <div className="h-4 w-24 rounded bg-primary-100" />

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-lg bg-primary-100" />
          <div className="h-4 w-64 rounded bg-primary-100" />
        </div>
        <div className="h-10 w-44 rounded-lg bg-primary-100" />
      </div>

      <div className="h-16 rounded-xl border border-primary-200 bg-white" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-64 rounded-xl border border-primary-200 bg-white" />
          <div className="h-48 rounded-xl border border-primary-200 bg-white" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl border border-primary-200 bg-white" />
          <div className="h-32 rounded-xl border border-primary-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
