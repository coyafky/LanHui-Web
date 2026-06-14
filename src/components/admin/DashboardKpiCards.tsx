import { Store, FileText, Eye, Calendar } from "lucide-react";
import type { DashboardKpi } from "@/lib/admin-dashboard";

interface Props {
  kpi: DashboardKpi | null;
}

const ITEMS = [
  { key: "activeStores" as const, label: "活跃门店", icon: Store, color: "text-orange-500" },
  { key: "publishedArticles" as const, label: "已发布文章", icon: FileText, color: "text-blue-400" },
  { key: "monthlyPageViews" as const, label: "本月访问", icon: Eye, color: "text-emerald-400" },
  { key: "monthlyReservations" as const, label: "本月预约", icon: Calendar, color: "text-purple-400" },
];

export function DashboardKpiCards({ kpi }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const value = kpi ? kpi[item.key].toLocaleString() : "—";
        return (
          <div key={item.key} className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-100">{value}</p>
          </div>
        );
      })}
    </div>
  );
}
