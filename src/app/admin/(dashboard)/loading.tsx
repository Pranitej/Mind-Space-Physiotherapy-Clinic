/** Streams immediately inside the admin shell while enquiries load. */
export default function AdminDashboardLoading() {
  return (
    <div role="status" className="motion-safe:animate-pulse">
      <span className="sr-only">Loading enquiries…</span>
      <div aria-hidden="true" className="mb-6">
        <div className="h-9 w-48 rounded-lg bg-border/70" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-border/50" />
      </div>
      <div aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="h-22 rounded-xl border border-border bg-surface first:col-span-2 sm:first:col-span-1"
          />
        ))}
      </div>
      <div
        aria-hidden="true"
        className="mt-6 h-13 w-full max-w-lg rounded-full border border-border bg-surface"
      />
      <div
        aria-hidden="true"
        className="mt-4 space-y-px overflow-hidden rounded-xl border border-border bg-border"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-16 bg-surface" />
        ))}
      </div>
    </div>
  );
}
