import type { ContentHealth } from "@/lib/admin-dashboard";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
  archived: "已归档",
};

interface Props {
  data: ContentHealth | null;
}

export function DashboardContentHealth({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">内容健康</h2>
        <p className="text-sm text-zinc-500">暂无数据</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">内容健康</h2>
      {/* 状态徽章 */}
      <div className="mb-5">
        <p className="mb-2 text-xs text-zinc-500">按状态</p>
        <div className="flex flex-wrap gap-2">
          {data.byStatus.length === 0 ? (
            <span className="text-sm text-zinc-500">暂无文章</span>
          ) : (
            data.byStatus.map((s) => (
              <span
                key={s.status}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                  STATUS_STYLES[s.status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"
                )}
              >
                {STATUS_LABELS[s.status] ?? s.status}
                <span className="text-zinc-400">·</span>
                <span className="font-bold">{s.count}</span>
              </span>
            ))
          )}
        </div>
      </div>
      {/* 分类 Top 5 */}
      <div>
        <p className="mb-2 text-xs text-zinc-500">按分类（Top 5）</p>
        {data.byCategory.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无分类</p>
        ) : (
          <ul className="space-y-1.5">
            {data.byCategory.map((c) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{c.category}</span>
                <span className="font-mono text-zinc-400">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
