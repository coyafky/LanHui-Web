import { auth } from "@/lib/auth";
import { getContentHealth, getDashboardSummaryV2 } from "@/lib/admin-dashboard";
import { DashboardKpiCards } from "@/components/admin/DashboardKpiCards";
import { DashboardContentHealth } from "@/components/admin/DashboardContentHealth";
import { DashboardStoreNetwork } from "@/components/admin/DashboardStoreNetwork";
import { DashboardRecentActivity } from "@/components/admin/DashboardRecentActivity";
import { DashboardQuickActions } from "@/components/admin/DashboardQuickActions";
import { DashboardTrendChart } from "@/components/admin/DashboardTrendChart";

export const dynamic = "force-dynamic";

function WelcomeHeader({ name }: { name: string }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  return (
    <div className="mb-2">
      <h1 className="text-2xl font-bold text-zinc-100">仪表盘</h1>
      <p className="mt-1 text-sm text-zinc-500">
        欢迎回来，<span className="text-zinc-300">{name}</span> · {dateStr}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "用户";
  const summary = await getDashboardSummaryV2(session);
  const contentHealth = await getContentHealth();
  return (
    <div className="space-y-6">
      <WelcomeHeader name={userName} />
      <DashboardKpiCards
        kpi={
          summary.kpi
            ? {
                activeStores: summary.kpi.activeStores,
                publishedArticles: summary.kpi.publishedArticles,
                monthlyPageViews: summary.kpi.monthlyPageViews,
                monthlyReservations: summary.kpi.monthlyContactIntent,
              }
            : null
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardContentHealth data={contentHealth.ok ? contentHealth.data : null} />
        <DashboardStoreNetwork data={summary.storeSummary} />
      </div>
      <DashboardTrendChart />
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardRecentActivity data={summary.recentActivity} />
        <DashboardQuickActions />
      </div>
    </div>
  );
}
