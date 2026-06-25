import { auth } from "@/lib/auth";
import { getDashboardSummaryV2 } from "@/lib/admin-dashboard";
import { DashboardWelcome } from "@/components/admin/DashboardWelcome";
import { DashboardTodoList } from "@/components/admin/DashboardTodoList";
import { DashboardKpiCards } from "@/components/admin/DashboardKpiCards";
import { DashboardStoreNetwork } from "@/components/admin/DashboardStoreNetwork";
import { DashboardContentHealth } from "@/components/admin/DashboardContentHealth";
import { DashboardInterestPanel } from "@/components/admin/DashboardInterestPanel";
import { DashboardTrendChart } from "@/components/admin/DashboardTrendChart";
import { DashboardRecentActivity } from "@/components/admin/DashboardRecentActivity";
import { DashboardQuickActions } from "@/components/admin/DashboardQuickActions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "用户";
  const role = session?.user?.role as "admin" | "editor" | undefined;
  const summary = await getDashboardSummaryV2(session);

  return (
    <div className="space-y-6">
      {/* A. 欢迎与今日摘要 */}
      <DashboardWelcome welcome={summary.welcome} userName={userName} />

      {/* B. 今日待办（横跨整行） */}
      <DashboardTodoList todos={summary.todoSummary} />

      {/* C. 经营 KPI */}
      <DashboardKpiCards kpi={summary.kpi} />

      {/* D + E. 门店网络 | 内容健康（2 列） */}
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardStoreNetwork data={summary.storeSummary} />
        <DashboardContentHealth data={summary.contentSummary} />
      </div>

      {/* F. 用户兴趣与咨询趋势 */}
      <DashboardInterestPanel data={summary.interestSummary} />

      {/* F.bis 30 天访问趋势（沿用 Phase A 的 DashboardTrendChart） */}
      <DashboardTrendChart />

      {/* G1 + G2. 最近操作 | 快捷入口（2 列） */}
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardRecentActivity data={summary.recentActivity} role={role} />
        <DashboardQuickActions actions={summary.quickActions} />
      </div>
    </div>
  );
}
