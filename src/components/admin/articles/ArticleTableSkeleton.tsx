export function ArticleTableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-32 rounded bg-zinc-800" />
        <div className="h-10 w-28 rounded-lg bg-zinc-800" />
      </div>
      <div className="mb-4 h-10 rounded-lg bg-zinc-800" />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-zinc-800 px-6 py-4 last:border-b-0"
          >
            <div className="h-4 w-4 rounded bg-zinc-800" />
            <div className="h-4 flex-1 rounded bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-800" />
            <div className="h-4 w-12 rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
