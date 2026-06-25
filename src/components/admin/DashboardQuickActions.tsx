import Link from "next/link";
import {
  Plus,
  FileText,
  BarChart3,
  MessageCircle,
  ImageOff,
  FileEdit,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { QuickActionV2 } from "@/lib/admin-dashboard";

interface Props {
  actions: QuickActionV2[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Plus,
  FileText,
  BarChart3,
  MessageCircle,
  ImageOff,
  FileEdit,
};

export function DashboardQuickActions({ actions }: Props) {
  const visible = actions.filter((a) => a.visible);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">快捷入口</h2>
      {visible.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无可用快捷入口</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((a) => {
            const Icon = ICON_MAP[a.iconName] ?? Plus;
            const body = (
              <>
                <div
                  className={cn(
                    "rounded-md p-2 transition-colors",
                    a.disabled
                      ? "bg-zinc-800 text-zinc-500"
                      : "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      a.disabled ? "text-zinc-500" : "text-zinc-100",
                    )}
                  >
                    {a.label}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{a.desc}</p>
                  {a.disabled && a.disabledHint && (
                    <p className="mt-1 text-xs text-zinc-600">{a.disabledHint}</p>
                  )}
                </div>
              </>
            );
            const className = cn(
              "group flex items-start gap-3 rounded-lg border bg-zinc-950 p-4",
              a.disabled
                ? "cursor-not-allowed border-zinc-800 opacity-60"
                : "border-zinc-800 transition-colors hover:border-orange-500/40 hover:bg-zinc-900",
            );
            return a.disabled ? (
              <div key={a.href} className={className} aria-disabled="true">
                {body}
              </div>
            ) : (
              <Link key={a.href} href={a.href} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
