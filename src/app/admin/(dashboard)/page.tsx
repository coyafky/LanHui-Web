import { Store, FileText, Eye, Calendar } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  let storeCount = 0;
  let articleCount = 0;
  let monthlyVisits = 0;
  let monthlyReservations = 0;

  try {
    [storeCount, articleCount, monthlyVisits, monthlyReservations] =
      await Promise.all([
        prisma.store.count({ where: { isActive: true } }),
        prisma.article.count({ where: { status: "published" } }),
        prisma.analyticsEvent.count({
          where: { timestamp: { gte: monthStart } },
        }),
        prisma.analyticsEvent.count({
          where: { type: "reservation", timestamp: { gte: monthStart } },
        }),
      ]);
  } catch (error) {
    console.error("[Dashboard] 数据库查询失败:", error);
  }

  const stats = [
    {
      label: "门店总数",
      value: storeCount,
      icon: Store,
      color: "text-orange-500",
    },
    {
      label: "文章总数",
      value: articleCount,
      icon: FileText,
      color: "text-blue-400",
    },
    {
      label: "本月访问",
      value: monthlyVisits,
      icon: Eye,
      color: "text-emerald-400",
    },
    {
      label: "本月预约",
      value: monthlyReservations,
      icon: Calendar,
      color: "text-purple-400",
    },
  ] as const;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-zinc-100">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{stat.label}</span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-3 text-3xl font-bold text-zinc-100">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
