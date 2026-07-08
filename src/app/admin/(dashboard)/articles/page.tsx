"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Pin,
  PinOff,
  Check,
} from "lucide-react";

type ArticleStatus = "draft" | "published" | "withdrawn" | "archived";
type ArticleAction =
  | "publish"
  | "withdraw"
  | "republish"
  | "archive"
  | "restore"
  | "sticky"
  | "unsticky";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: ArticleStatus;
  category: string | null;
  publishedAt: string | null;
  viewCount: number;
  isSticky: boolean;
  createdAt: string;
  author: { id: string; name: string | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: { label: "草稿", className: "bg-zinc-700 text-zinc-300" },
  published: { label: "已发布", className: "bg-emerald-900/50 text-emerald-400" },
  withdrawn: { label: "已撤回", className: "bg-amber-900/50 text-amber-400" },
  archived: { label: "已归档", className: "bg-yellow-900/50 text-yellow-400" },
};

// Fallback: 当 /api/articles/categories 请求失败时,使用这份静态列表保证下拉仍可使用。
// 实际展示以 DB 中实际存在的 category 为准。
const CATEGORIES_FALLBACK = [
  { value: "新闻", label: "新闻" },
  { value: "行业动态", label: "行业动态" },
  { value: "产品知识", label: "产品知识" },
  { value: "公司公告", label: "公司公告" },
];

interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "withdrawn", label: "已撤回" },
  { value: "archived", label: "已归档" },
];

const ACTION_LABELS: Record<ArticleAction | "delete", string> = {
  publish: "发布",
  withdraw: "撤回",
  republish: "重新发布",
  archive: "归档",
  restore: "恢复草稿",
  sticky: "置顶",
  unsticky: "取消置顶",
  delete: "删除",
};

function actionsForArticle(article: Article): ArticleAction[] {
  const stickyAction: ArticleAction = article.isSticky ? "unsticky" : "sticky";
  if (article.status === "draft") return ["publish", "archive", stickyAction];
  if (article.status === "published") return ["withdraw", stickyAction];
  if (article.status === "withdrawn") return ["republish", "archive", stickyAction];
  return ["restore"];
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={<div className="text-zinc-500">加载中...</div>}>
      <ArticlesPageContent />
    </Suspense>
  );
}

function ArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 处理从新建/编辑页传来的 query params,转为 toast 并清理 URL
  useEffect(() => {
    const created = searchParams.get("created");
    const updated = searchParams.get("updated");
    if (created) {
      toast.success("创建成功", { description: decodeURIComponent(created) });
    } else if (updated) {
      toast.success("更新成功", { description: decodeURIComponent(updated) });
    }
    if (created || updated) {
      router.replace("/admin/articles");
    }
  }, [searchParams, router]);

  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 拉取 DB 实际存在的分类字典(失败时降级为 CATEGORIES_FALLBACK)
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/articles/categories");
        const json = (await res.json()) as {
          success: boolean;
          data?: { categories: CategoryOption[] };
        };
        if (cancelled) return;
        if (json.success && Array.isArray(json.data?.categories)) {
          setCategories(json.data.categories);
        } else {
          setCategories(CATEGORIES_FALLBACK);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("[articles] 加载分类字典失败,使用 fallback", err);
        setCategories(CATEGORIES_FALLBACK);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/articles?${params}`);
      const json = await res.json();
      if (json.success) {
        setArticles(json.data);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error("获取文章列表失败", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pagination.page, statusFilter, categoryFilter, search]);

  // 点击菜单外部关闭
  useEffect(() => {
    if (!openMenuId) return;
    function handleClick(e: MouseEvent) {
      const node = containerRefs.current[openMenuId!];
      if (node && !node.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  async function handleArticleAction(article: Article, action: ArticleAction) {
    const needsConfirm = action === "withdraw" || action === "archive" || action === "restore";
    if (needsConfirm && !confirm(`确认${ACTION_LABELS[action]}这篇文章吗？`)) return;
    const res = await fetch(`/api/articles/${article.id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.ok) {
      setOpenMenuId(null);
      await fetchArticles();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(`${ACTION_LABELS[action]}失败`, {
        description: json.error || "请稍后重试",
      });
    }
  }

  async function handleBulkAction(action: "publish" | "withdraw" | "archive" | "delete") {
    if (selectedIds.size === 0) return;
    if (!confirm(`确认对 ${selectedIds.size} 篇文章执行${ACTION_LABELS[action]}吗？`)) return;
    const res = await fetch("/api/articles/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: Array.from(selectedIds) }),
    });
    if (res.ok) {
      setSelectedIds(new Set());
      await fetchArticles();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(`批量${ACTION_LABELS[action]}失败`, {
        description: json.error || "请稍后重试",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await fetchArticles();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error("删除失败", {
        description: json.error || "请稍后重试",
      });
    }
  }

  const visibleArticleIds = articles.map((article) => article.id);
  const allVisibleSelected =
    visibleArticleIds.length > 0 && visibleArticleIds.every((id) => selectedIds.has(id));

  function toggleAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleArticleIds.forEach((id) => next.delete(id));
      } else {
        visibleArticleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleArticleSelection(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  return (
    <div>
      {/* 页头 */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">文章管理</h1>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          新建文章
        </Link>
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索文章标题..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
        >
          <option value="">全部分类</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
              {typeof cat.count === "number" ? ` (${cat.count})` : ""}
            </option>
          ))}
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
          <span className="text-sm text-orange-200">
            已选择 {selectedIds.size} 篇文章
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleBulkAction("publish")}
              className="rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-medium text-orange-200 transition-colors hover:bg-orange-500/15"
            >
              批量发布
            </button>
            <button
              type="button"
              onClick={() => void handleBulkAction("withdraw")}
              className="rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-medium text-orange-200 transition-colors hover:bg-orange-500/15"
            >
              批量撤回
            </button>
            <button
              type="button"
              onClick={() => void handleBulkAction("archive")}
              className="rounded-lg border border-orange-500/40 px-3 py-1.5 text-xs font-medium text-orange-200 transition-colors hover:bg-orange-500/15"
            >
              批量归档
            </button>
            <button
              type="button"
              onClick={() => void handleBulkAction("delete")}
              className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10"
            >
              批量删除
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              清空
            </button>
          </div>
        </div>
      )}

      {/* 表格 */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="选择当前页全部文章"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="accent-orange-500"
                />
              </th>
              <th className="px-4 py-3 font-medium text-zinc-400">标题</th>
              <th className="px-4 py-3 font-medium text-zinc-400">分类</th>
              <th className="px-4 py-3 font-medium text-zinc-400">状态</th>
              <th className="px-4 py-3 font-medium text-zinc-400">作者</th>
              <th className="px-4 py-3 font-medium text-zinc-400">发布时间</th>
              <th className="px-4 py-3 font-medium text-zinc-400">浏览</th>
              <th className="px-4 py-3 font-medium text-zinc-400 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                  加载中...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                  暂无文章
                </td>
              </tr>
            ) : (
              articles.map((article) => {
                const statusInfo = STATUS_MAP[article.status] || STATUS_MAP.draft;
                return (
                  <tr
                    key={article.id}
                    className="group transition-colors hover:bg-zinc-900/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`选择文章 ${article.title}`}
                        checked={selectedIds.has(article.id)}
                        onChange={() => toggleArticleSelection(article.id)}
                        className="accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {article.isSticky && (
                          <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-xs font-medium text-orange-400">
                            置顶
                          </span>
                        )}
                        <span className="max-w-[300px] truncate font-medium text-zinc-200">
                          {article.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{article.category || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {article.author.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{article.viewCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div
                        ref={(el) => {
                          containerRefs.current[article.id] = el;
                        }}
                        className="relative inline-block"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === article.id ? null : article.id);
                          }}
                          className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openMenuId === article.id && (
                          <div
                            className="absolute right-0 top-full z-10 mt-1 w-36 rounded-lg border border-zinc-800 bg-zinc-900 py-1 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/admin/articles/${article.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              编辑
                            </Link>
                            {actionsForArticle(article).map((action) => {
                              const Icon =
                                action === "publish" || action === "republish"
                                  ? Eye
                                  : action === "sticky"
                                    ? Pin
                                    : action === "unsticky"
                                      ? PinOff
                                      : action === "restore"
                                        ? Check
                                        : X;
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => void handleArticleAction(article, action)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                                >
                                  <Icon className="h-3.5 w-3.5" />
                                  {ACTION_LABELS[action]}
                                </button>
                              );
                            })}
                            <button
                              type="button"
                              onClick={() => handleDelete(article.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-800"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            共 {pagination.total} 篇文章
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-zinc-400">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
