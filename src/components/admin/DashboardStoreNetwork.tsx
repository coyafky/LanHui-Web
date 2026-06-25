import Link from "next/link";
import { Store, MapPin, AlertCircle, Layers } from "lucide-react";
import type { StoreSummaryV2 } from "@/lib/admin-dashboard";

interface Props {
  data: StoreSummaryV2 | null;
}

const STATUS_BADGE: Record<StoreSummaryV2["byStatus"][number]["status"], string> = {
  pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspended: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  terminated: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DashboardStoreNetwork({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">门店网络</h2>
        </div>
        <p className="text-sm text-zinc-500">门店数据加载失败</p>
      </div>
    );
  }

  const max = data.topProvinces.length > 0 ? data.topProvinces[0].count : 0;
  const visibleStatuses = data.byStatus.filter((s) => s.count > 0);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">门店网络</h2>
        </div>
        {data.missingProfile > 0 && (
          <Link
            href="/admin/stores?image=missing"
            className="inline-flex items-center gap-1 text-xs text-amber-400 transition-opacity hover:opacity-80"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            {data.missingProfile} 家待完善
          </Link>
        )}
      </div>

      {/* 四态分布 */}
      <div className="mb-5">
        <p className="mb-2 text-xs text-zinc-500">状态分布</p>
        {visibleStatuses.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无门店</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleStatuses.map((s) => (
              <Link
                key={s.status}
                href={`/admin/stores?status=${s.status}`}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 ${STATUS_BADGE[s.status]}`}
              >
                {s.label}
                <span className="text-zinc-400">·</span>
                <span className="font-bold">{s.count}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 等级分布 */}
      {data.byLevel.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 flex items-center gap-1 text-xs text-zinc-500">
            <Layers className="h-3 w-3" />
            等级分布
          </p>
          <div className="flex flex-wrap gap-2">
            {data.byLevel.map((l) => (
              <Link
                key={l.level}
                href={`/admin/stores?level=${l.level}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-orange-500/40 hover:text-orange-400"
              >
                {l.label}
                <span className="text-zinc-500">·</span>
                <span className="font-mono">{l.count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top 10 省份（仅营业中） */}
      <div>
        <p className="mb-2 flex items-center gap-1 text-xs text-zinc-500">
          <MapPin className="h-3 w-3" />
          营业中门店省份 Top 10
        </p>
        {data.topProvinces.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无营业中门店</p>
        ) : (
          <ul className="space-y-2">
            {data.topProvinces.map((p) => (
              <li key={p.provinceSlug}>
                <Link
                  href={`/admin/stores?province=${p.provinceSlug}`}
                  className="flex items-center gap-3 text-sm transition-opacity hover:opacity-80"
                >
                  <span className="w-16 shrink-0 truncate text-zinc-300">{p.provinceLabel}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-orange-500"
                      style={{ width: `${max > 0 ? (p.count / max) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-mono text-zinc-400">
                    {p.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}