import Link from "next/link";
import { Activity } from "lucide-react";
import type { RecentActivity, RecentActivityItem } from "@/lib/admin-dashboard";

interface Props {
  data: RecentActivity | null;
  role: "admin" | "editor" | undefined;
}

const ACTION_LABELS: Record<string, string> = {
  "article.create": "创建文章",
  "article.update": "更新文章",
  "article.delete": "删除文章",
  "store.create": "创建门店",
  "store.update": "更新门店",
  "store.delete": "删除门店",
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  update: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delete: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatRelative(date: Date): string {
  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);
  if (diff < 60) return `${diff} 秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} 天前`;
  return date.toLocaleDateString("zh-CN");
}

function actionBadgeClass(action: string): string {
  if (action.endsWith(".create")) return ACTION_COLORS.create ?? "";
  if (action.endsWith(".update")) return ACTION_COLORS.update ?? "";
  if (action.endsWith(".delete")) return ACTION_COLORS.delete ?? "";
  return "bg-zinc-700 text-zinc-300 border-zinc-600";
}

function entityHref(entity: string, id: string): string | null {
  if (entity === "article") return `/admin/articles/${id}`;
  if (entity === "store") return `/admin/stores/${id}`;
  return null;
}

function isStoreCreateForEditor(item: RecentActivityItem): boolean {
  return item.entity === "store" && item.action.endsWith(".create");
}

export function DashboardRecentActivity({ data, role }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">最近操作</h2>
        </div>
        <p className="text-sm text-zinc-500">操作记录加载失败</p>
      </div>
    );
  }

  // T9 权限过滤：editor 角色隐藏 store.create 条目
  const visibleItems =
    role === "editor" ? data.items.filter((it) => !isStoreCreateForEditor(it)) : data.items;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-semibold text-zinc-100">最近操作</h2>
        </div>
        <span className="text-xs text-zinc-500">当前角色：{role === "admin" ? "管理员" : "编辑"}</span>
      </div>
      {visibleItems.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无操作记录</p>
      ) : (
        <ul className="divide-y divide-zinc-800">
          {visibleItems.map((item) => {
            const href = entityHref(item.entity, item.entityId);
            const inner = (
              <>
                <span className="w-28 shrink-0 text-xs text-zinc-500">
                  {formatRelative(item.createdAt)}
                </span>
                <span className="w-20 shrink-0 text-sm text-zinc-300">
                  {item.actorName ?? "系统"}
                </span>
                <span
                  className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-medium ${actionBadgeClass(item.action)}`}
                >
                  {ACTION_LABELS[item.action] ?? item.action}
                </span>
                <span className="flex-1 truncate text-xs text-zinc-500">
                  {item.entity}#{item.entityId.slice(0, 8)}
                </span>
              </>
            );
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                {href ? (
                  <Link
                    href={href}
                    className="flex w-full items-center gap-3 hover:opacity-80"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex w-full items-center gap-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
