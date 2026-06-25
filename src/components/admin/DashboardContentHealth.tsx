import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ContentSummaryV2 } from "@/lib/admin-dashboard";

interface Props {
  data: ContentSummaryV2 | null;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  archived: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  withdrawn: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function DashboardContentHealth({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">内容健康</h2>
        </div>
        <p className="text-sm text-zinc-500">内容数据加载失败</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">内容健康</h2>
        </div>
        <span className="text-xs text-zinc-500">
          最近 7 天新发布：<span className="font-bold text-zinc-300">{data.recent7dPublished}</span> 篇
        </span>
      </div>

      {/* 状态徽章（全部展示含 withdrawn 即使为 0） */}
      <div className="mb-5">
        <p className="mb-2 text-xs text-zinc-500">按状态</p>
        {data.byStatus.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无文章</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.byStatus.map((s) => (
              <span
                key={s.status}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium",
                  STATUS_STYLES[s.status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600",
                )}
              >
                {s.label}
                <span className="text-zinc-400">·</span>
                <span className="font-bold">{s.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 分类 Top 5 */}
      <div className="mb-5">
        <p className="mb-2 text-xs text-zinc-500">按分类（Top 5）</p>
        {data.topCategories.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无分类</p>
        ) : (
          <ul className="space-y-1.5">
            {data.topCategories.map((c) => (
              <li
                key={c.category}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-300">{c.category}</span>
                <span className="font-mono text-zinc-400">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 缺封面图（仅展示数字） */}
      <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
        <span className="text-zinc-500">缺封面图</span>
        <span className="ml-2 font-mono font-bold text-zinc-300">
          {data.missingCover}
        </span>
        <span className="ml-1 text-xs text-zinc-600">篇</span>
      </div>
    </div>
  );
}
