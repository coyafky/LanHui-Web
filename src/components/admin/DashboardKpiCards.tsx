import { Store, FileText, Eye, Phone } from "lucide-react";
import type { DashboardKpiV2 } from "@/lib/admin-dashboard";

interface Props {
  kpi: DashboardKpiV2 | null;
}

const ITEMS: Array<{
  key: keyof DashboardKpiV2;
  label: string;
  icon: typeof Store;
  color: string;
}> = [
  { key: "activeStores", label: "营业中门店", icon: Store, color: "text-orange-500" },
  { key: "publishedArticles", label: "已发布文章", icon: FileText, color: "text-blue-400" },
  { key: "monthlyPageViews", label: "本月访问", icon: Eye, color: "text-emerald-400" },
  { key: "monthlyContactIntent", label: "本月咨询意向", icon: Phone, color: "text-purple-400" },
];

export function DashboardKpiCards({ kpi }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const value = kpi ? kpi[item.key].toLocaleString() : "—";
        return (
          <div
            key={item.key}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            aria-label={item.label}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{item.label}</span>
              <Icon className={`h-5 w-5 ${item.color}`} />
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-100">{value}</p>
          </div>
        );
      })}
      {!kpi && (
        <p className="col-span-full -mt-3 text-center text-xs text-zinc-600">
          数据暂不可用
        </p>
      )}
    </div>
  );
}
