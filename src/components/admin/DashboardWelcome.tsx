import type { DashboardWelcomeV2 } from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

interface Props {
  welcome: DashboardWelcomeV2 | null;
  userName: string;
}

const SEVERITY_STYLES: Record<DashboardWelcomeV2["severity"], string> = {
  ok: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
  warn: "border-orange-500/20 bg-orange-500/5 text-orange-300",
  error: "border-red-500/20 bg-red-500/5 text-red-300",
};

const SEVERITY_LABELS: Record<DashboardWelcomeV2["severity"], string> = {
  ok: "今日运营正常",
  warn: "请关注",
  error: "需立即处理",
};

export function DashboardWelcome({ welcome, userName }: Props) {
  const dateStr =
    welcome?.today ??
    new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  const severity = welcome?.severity ?? "ok";
  const summaryText = welcome?.summaryText ?? "欢迎使用蓝辉轻改 CMS。";

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-zinc-100">仪表盘</h1>
      <p className="text-sm text-zinc-500">
        欢迎回来，<span className="text-zinc-300">{userName}</span> · {dateStr}
      </p>
      <div
        className={cn(
          "mt-3 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
          SEVERITY_STYLES[severity],
        )}
        role="status"
        aria-label={SEVERITY_LABELS[severity]}
      >
        <span className="font-medium">{SEVERITY_LABELS[severity]}</span>
        <span className="text-zinc-400">·</span>
        <span className="text-zinc-300">{summaryText}</span>
      </div>
    </div>
  );
}
