import type { StoreNetwork } from "@/lib/admin-dashboard";

interface Props {
  data: StoreNetwork | null;
}

export function DashboardStoreNetwork({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">门店网络</h2>
        <p className="text-sm text-zinc-500">暂无数据</p>
      </div>
    );
  }
  const top = data.byProvince.slice(0, 10);
  const others = data.byProvince.slice(10);
  const othersCount = others.reduce((sum, p) => sum + p.count, 0);
  const max = top.length > 0 ? top[0].count : 0;
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">门店网络</h2>
        <div className="flex gap-3 text-xs">
          <span className="text-zinc-400">
            活跃 <span className="font-mono text-emerald-400">{data.totalActive}</span>
          </span>
          <span className="text-zinc-400">
            禁用 <span className="font-mono text-zinc-500">{data.totalInactive}</span>
          </span>
        </div>
      </div>
      {top.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无活跃门店</p>
      ) : (
        <ul className="space-y-2">
          {top.map((p) => (
            <li key={p.provinceSlug} className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 text-zinc-300">{p.provinceLabel}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${max > 0 ? (p.count / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right font-mono text-zinc-400">{p.count}</span>
            </li>
          ))}
          {othersCount > 0 && (
            <li className="pt-1 text-xs text-zinc-500">其他 {others.length} 个省份 · {othersCount} 家门店</li>
          )}
        </ul>
      )}
    </div>
  );
}
