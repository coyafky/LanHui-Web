import Link from "next/link";
import { Plus, FileText, BarChart3, ListChecks } from "lucide-react";

const ACTIONS = [
  {
    href: "/admin/stores/new",
    label: "新建门店",
    desc: "添加一个新门店到网络",
    icon: Plus,
  },
  {
    href: "/admin/articles/new",
    label: "新建文章",
    desc: "撰写新闻或行业文章",
    icon: FileText,
  },
  {
    href: "/admin/analytics",
    label: "查看分析",
    desc: "访问趋势与门店热度",
    icon: BarChart3,
  },
  {
    href: "/admin/stores",
    label: "门店列表",
    desc: "管理所有门店信息",
    icon: ListChecks,
  },
];

export function DashboardQuickActions() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">快捷入口</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition-colors hover:border-orange-500/40 hover:bg-zinc-900"
            >
              <div className="rounded-md bg-orange-500/10 p-2 text-orange-500 group-hover:bg-orange-500/20">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-100">{a.label}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
