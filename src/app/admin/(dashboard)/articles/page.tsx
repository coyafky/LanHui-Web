"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
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
  archived: { label: "已归档", className: "bg-yellow-900/50 text-yellow-400" },
};

const CATEGORIES = [
  { value: "", label: "全部分类" },
  { value: "新闻", label: "新闻" },
  { value: "行业动态", label: "行业动态" },
  { value: "产品知识", label: "产品知识" },
  { value: "公司公告", label: "公司公告" },
];

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "draft", label: "草稿" },
  { value: "published", label: "已发布" },
  { value: "archived", label: "已归档" },
];

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
  const created = searchParams.get("created");
  const updated = searchParams.get("updated");
  const [banner, setBanner] = useState<{ type: "created" | "updated"; title: string } | null>(null);

  useEffect(() => {
    if (created) {
      setBanner({ type: "created", title: decodeURIComponent(created) });
    } else if (updated) {
      setBanner({ type: "updated", title: decodeURIComponent(updated) });
    }
  }, [created, updated]);

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  // 点击其他地方关闭菜单
  useEffect(() => {
    function handleClick() {
      setOpenMenuId(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  async function handleTogglePublish(article: Article) {
    const newStatus = article.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/articles/${article.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      fetchArticles();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除这篇文章吗？此操作不可撤销。")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchArticles();
    } else {
      const json = await res.json();
      alert(json.error || "删除失败");
    }
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
      {banner && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-emerald-900/50 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-400">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>文章 &quot;{banner.title}&quot; {banner.type === "created" ? "创建" : "更新"}成功</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setBanner(null);
              router.replace("/admin/articles");
            }}
            className="text-emerald-400 hover:text-emerald-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

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
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
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
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                  加载中...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
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
                      <div className="relative inline-block">
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
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(article)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
                            >
                              {article.status === "published" ? (
                                <>
                                  <EyeOff className="h-3.5 w-3.5" />
                                  取消发布
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3.5 w-3.5" />
                                  发布
                                </>
                              )}
                            </button>
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
