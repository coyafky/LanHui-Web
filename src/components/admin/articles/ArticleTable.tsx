"use client";

import Link from "next/link";
import type { Article } from "@/components/admin/shared/types";
import { STATUS_MAP } from "@/components/admin/shared/types";
import { EmptyState } from "@/components/admin/shared/EmptyState";
import { ArticleRowMenu } from "@/components/admin/articles/ArticleRowMenu";

interface ArticleTableProps {
  articles: Article[];
  selectedIds: Set<string>;
  loading: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onTogglePublish: (article: Article) => void;
  onToggleSticky: (article: Article) => void;
  onDelete: (article: Article) => void;
  openMenuId: string | null;
  onOpenMenu: (id: string | null) => void;
  containerRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export function ArticleTable({
  articles,
  selectedIds,
  loading,
  onToggleSelectAll,
  onToggleSelectOne,
  onTogglePublish,
  onToggleSticky,
  onDelete,
  openMenuId,
  onOpenMenu,
  containerRefs,
}: ArticleTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full">
        <thead className="border-b border-zinc-800 bg-zinc-900/50">
          <tr>
            <th className="px-4 py-3 w-10">
              <input
                type="checkbox"
                checked={articles.length > 0 && selectedIds.size === articles.length}
                onChange={onToggleSelectAll}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-orange-500"
              />
            </th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400">标题</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400 hidden sm:table-cell">分类</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400 hidden md:table-cell">状态</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400 hidden lg:table-cell">发布时间</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400 hidden lg:table-cell">阅读</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-400 hidden lg:table-cell">作者</th>
            <th className="px-4 py-3 w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {loading ? (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center text-sm text-zinc-500">
                加载中...
              </td>
            </tr>
          ) : articles.length === 0 ? (
            <EmptyState
              title="暂无文章"
              description="点击右上角「新建文章」创建第一篇文章"
            />
          ) : (
            articles.map((article) => {
              const status = STATUS_MAP[article.status] ?? {
                label: article.status,
                className: "bg-zinc-700 text-zinc-300",
              };

              return (
                <tr
                  key={article.id}
                  className="group transition-colors hover:bg-zinc-900/50"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(article.id)}
                      onChange={() => onToggleSelectOne(article.id)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-800 accent-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="text-sm font-medium text-zinc-200 transition-colors hover:text-orange-400"
                      >
                        {article.title}
                      </Link>
                      {article.isSticky && (
                        <span className="shrink-0 rounded bg-orange-900/50 px-1.5 py-0.5 text-[10px] text-orange-400">
                          置顶
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-zinc-400">
                      {article.category || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-zinc-400">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("zh-CN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-zinc-400">
                    {article.viewCount}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-sm text-zinc-400">
                    {article.author.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleRowMenu
                      article={article}
                      open={openMenuId === article.id}
                      onTogglePublish={() => onTogglePublish(article)}
                      onToggleSticky={() => onToggleSticky(article)}
                      onDelete={() => onDelete(article)}
                      onClose={() =>
                        onOpenMenu(openMenuId === article.id ? null : article.id)
                      }
                      containerRef={(el) => {
                        containerRefs.current[article.id] = el;
                      }}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
