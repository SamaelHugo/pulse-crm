export default function DashboardLoading() {
  return (
    <>
      {/* Topbar skeleton */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 px-8">
        <div className="h-5 w-24 animate-pulse rounded bg-bg-elevated" />
        <div className="mx-auto h-9 w-full max-w-md animate-pulse rounded-lg bg-bg-elevated" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-bg-elevated" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-bg-elevated" />
        </div>
      </div>

      <div className="space-y-6 p-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-6">
              <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
              <div className="mt-3 h-8 w-32 animate-pulse rounded bg-bg-elevated" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded bg-bg-elevated" />
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
                <div className="h-7 w-28 animate-pulse rounded-lg bg-bg-elevated" />
              </div>
              <div className="h-72 animate-pulse rounded bg-bg-elevated/50" />
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-bg-card p-6">
              <div className="mb-6 h-4 w-32 animate-pulse rounded bg-bg-elevated" />
              <div className="mx-auto h-56 w-44 animate-pulse rounded-full bg-bg-elevated/50" />
            </div>
          </div>
        </div>

        {/* Recent deals skeleton */}
        <div className="rounded-xl border border-border bg-bg-card">
          <div className="border-b border-border px-6 py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-bg-elevated" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-6 py-4 last:border-b-0">
              <div className="h-8 w-8 animate-pulse rounded-full bg-bg-elevated" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-bg-elevated" />
                <div className="h-2 w-20 animate-pulse rounded bg-bg-elevated/50" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded bg-bg-elevated" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
