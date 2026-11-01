/** Streams immediately inside the admin shell while enquiries load; shaped like the dashboard. */
export default function AdminDashboardLoading() {
  return (
    <div role="status" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading enquiries…</span>
      <div aria-hidden="true" className="mb-6">
        <div className="h-9 w-48 rounded-lg bg-border/70" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-border/50" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-24 rounded-2xl border border-border bg-surface first:col-span-2 sm:first:col-span-4 md:first:col-span-1"
          />
        ))}
      </div>
      <div aria-hidden="true" className="mt-6 h-17 rounded-2xl border border-border bg-surface sm:h-19" />
      <div aria-hidden="true" className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="h-12 border-b border-border bg-background/70" />
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-5">
              <div className="size-9 shrink-0 rounded-full bg-border/60" />
              <div className="h-4 w-40 rounded bg-border/60" />
              <div className="ml-auto h-9 w-36 rounded-xl bg-border/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
