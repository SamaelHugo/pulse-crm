export default function DealsLoading() {
  return (
    <>
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-bg-base/80 px-8">
        <div className="h-5 w-20 animate-pulse rounded bg-bg-elevated" />
        <div className="mx-auto h-9 w-full max-w-md animate-pulse rounded-lg bg-bg-elevated" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-bg-elevated" />
          <div className="h-8 w-8 animate-pulse rounded-full bg-bg-elevated" />
        </div>
      </div>

      <div className="space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-6 w-20 animate-pulse rounded bg-bg-elevated" />
            <div className="h-5 w-8 animate-pulse rounded bg-bg-elevated" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-9 w-20 animate-pulse rounded-lg bg-bg-elevated" />
            <div className="h-9 w-32 animate-pulse rounded-lg bg-bg-elevated" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-bg-card p-4">
              <div className="h-2.5 w-16 animate-pulse rounded bg-bg-elevated" />
              <div className="mt-2 h-5 w-24 animate-pulse rounded bg-bg-elevated" />
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          {[...Array(5)].map((_, col) => (
            <div key={col} className="w-[280px] shrink-0 rounded-xl bg-bg-card/50">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-bg-elevated" />
                <div className="h-4 w-20 animate-pulse rounded bg-bg-elevated" />
                <div className="h-4 w-6 animate-pulse rounded bg-bg-elevated" />
              </div>
              <div className="space-y-2 p-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="rounded-lg border border-border bg-bg-card p-3.5">
                    <div className="h-3.5 w-28 animate-pulse rounded bg-bg-elevated" />
                    <div className="mt-2 h-2.5 w-20 animate-pulse rounded bg-bg-elevated/50" />
                    <div className="mt-3 h-3 w-16 animate-pulse rounded bg-bg-elevated" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
