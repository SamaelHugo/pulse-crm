export default function ClientsLoading() {
  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 px-8">
        <div className="h-5 w-24 animate-pulse rounded bg-bg-elevated" />
        <div className="mx-auto h-9 w-full max-w-md animate-pulse rounded-lg bg-bg-elevated" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-bg-elevated" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-bg-elevated" />
        </div>
      </div>

      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-24 animate-pulse rounded bg-bg-elevated" />
            <div className="h-5 w-8 animate-pulse rounded bg-bg-elevated" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-elevated" />
        </div>

        <div className="flex gap-3">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-bg-elevated" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-elevated" />
          <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-elevated" />
        </div>

        <div className="rounded-xl border border-border bg-bg-card">
          <div className="border-b border-border bg-bg-elevated/50 px-4 py-3">
            <div className="flex gap-4">
              {[80, 60, 48, 40, 56, 64, 48].map((w, i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-bg-elevated" style={{ width: w }} />
              ))}
            </div>
          </div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-b-0">
              <div className="h-4 w-4 animate-pulse rounded bg-bg-elevated" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-bg-elevated" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 animate-pulse rounded bg-bg-elevated" />
                <div className="h-2 w-36 animate-pulse rounded bg-bg-elevated/50" />
              </div>
              <div className="h-3 w-24 animate-pulse rounded bg-bg-elevated" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-bg-elevated" />
              <div className="h-3 w-8 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-16 animate-pulse rounded bg-bg-elevated" />
              <div className="h-3 w-20 animate-pulse rounded bg-bg-elevated" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
