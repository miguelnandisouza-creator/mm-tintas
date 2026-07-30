export default function CatalogLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-14 sm:px-8 lg:px-10">
      <div className="h-4 w-36 animate-pulse rounded-full bg-muted" />
      <div className="mt-5 h-12 max-w-2xl animate-pulse rounded-2xl bg-muted" />
      <div className="mt-3 h-6 max-w-xl animate-pulse rounded-xl bg-muted" />
      <div className="mt-12 h-28 animate-pulse rounded-2xl border bg-muted/70" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            // Static loading placeholders do not have stable domain identifiers.
            key={index}
            className="overflow-hidden rounded-2xl border bg-card"
          >
            <div className="aspect-[4/3] animate-pulse bg-muted" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              <div className="h-6 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
