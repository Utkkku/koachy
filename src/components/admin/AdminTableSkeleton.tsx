export function AdminTableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse space-y-0">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid gap-0 border-b-2 border-gray-200"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((__, j) => (
            <div key={j} className="h-12 bg-gray-100 border-r border-gray-100 last:border-r-0" />
          ))}
        </div>
      ))}
    </div>
  );
}
