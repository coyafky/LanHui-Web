type Column = { key: string; label: string };

export function SpecsTable({
  columns,
  data,
  title,
}: {
  columns: Column[];
  data: Record<string, string>[];
  title?: string;
}) {
  return (
    <section className="py-16 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              {title}
            </h2>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-orange-950/40 text-orange-300">
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left font-semibold border border-zinc-800">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.model ?? i} className="border-b border-zinc-800">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 border-x border-zinc-800 text-zinc-300">
                      {row[col.key] ?? "\u2014"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}