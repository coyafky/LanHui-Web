"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
import {
  type Article,
  type Pagination,
  type ArticleAction,
  type PendingArticleConfirm,
  ACTION_LABELS,
} from "@/components/admin/shared/types";
import { useCategories } from "@/hooks/use-categories";
import { ArticleFilterBar } from "@/components/admin/articles/ArticleFilterBar";
import { ArticleTable } from "@/components/admin/articles/ArticleTable";
import { ArticleBulkToolbar } from "@/components/admin/articles/ArticleBulkToolbar";
import { PaginationBar } from "@/components/admin/shared/PaginationBar";

interface Props {
  initialArticles: Article[];
  initialTotal: number;
}

export function ArticlesPageClient({ initialArticles, initialTotal }: Props) {
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

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: initialTotal,
    totalPages: Math.ceil(initialTotal / 20),
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { categories } = useCategories();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingArticleConfirm>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
    if (!search && !statusFilter && !categoryFilter && pagination.page === 1) return;
    fetchArticles();
  }, [fetchArticles, search, statusFilter, categoryFilter, pagination.page]);

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

  function toggleSelectAll() {
    if (selectedIds.size === articles.length && articles.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(articles.map((a) => a.id)));
    }
  }

  function toggleSelectOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function handleTogglePublish(article: Article) {
    const action: ArticleAction = article.status === "published" ? "unpublish" : "publish";
    setPendingConfirm({ type: "single", article, action });
  }

  async function handleToggleSticky(article: Article) {
    const action = article.isSticky ? "unsticky" : "sticky";
    const res = await adminCsrfFetch(`/api/articles/${article.id}/${action}`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success(article.isSticky ? "已取消置顶" : "已置顶");
      fetchArticles();
    } else {
      const json = await res.json().catch(() => ({}));
      toast.error(json.error || `${article.isSticky ? "取消置顶" : "置顶"}失败`);
    }
  }

  function handleDelete(article: Article) {
    setPendingConfirm({ type: "delete", article });
  }

  function getConfirmDialogProps(pending: NonNullable<PendingArticleConfirm>) {
    switch (pending.type) {
      case "single":
        return {
          title: `确认${ACTION_LABELS[pending.action]}文章？`,
          variant: "default" as const,
        };
      case "delete":
        return {
          title: "确认删除文章？",
          description: "删除后不可恢复",
          confirmLabel: "删除",
          variant: "danger" as const,
        };
      case "bulk": {
        const isDelete = pending.action === "delete";
        return {
          title: `确认对 ${pending.ids.length} 篇文章执行${ACTION_LABELS[pending.action]}吗？`,
          description: isDelete ? "此操作不可撤销" : undefined,
          confirmLabel: isDelete ? "删除" : "确认",
          variant: (isDelete ? "danger" : "default") as "danger" | "default",
        };
      }
    }
  }

  async function handleConfirmAction() {
    if (!pendingConfirm) return;
    try {
      if (pendingConfirm.type === "delete") {
        const res = await adminCsrfFetch(
          `/api/articles/${pendingConfirm.article.id}`,
          { method: "DELETE" },
        );
        if (res.ok) {
          toast.success("删除成功");
          setPendingConfirm(null);
          fetchArticles();
          return;
        }
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || "删除失败");
      } else if (pendingConfirm.type === "single") {
        const { article, action } = pendingConfirm;
        const routeAction = action === "unpublish" ? "withdraw" : action;
        const res = await adminCsrfFetch(
          `/api/articles/${article.id}/${routeAction}`,
          { method: "POST" },
        );
        if (res.ok) {
          toast.success(`${ACTION_LABELS[action]}成功`);
          setPendingConfirm(null);
          fetchArticles();
          return;
        }
        const json = await res.json().catch(() => ({}));
        toast.error(json.error || `${ACTION_LABELS[action]}失败`);
      } else if (pendingConfirm.type === "bulk") {
        const { action, ids } = pendingConfirm;
        const res = await adminCsrfFetch("/api/articles/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ids }),
        });
        const json = await res.json();
        if (json.success) {
          const { succeeded, skipped, failed } = json.data as {
            succeeded: unknown[];
            skipped: unknown[];
            failed: unknown[];
          };
          if (failed.length === 0 && skipped.length === 0) {
            toast.success(`已${ACTION_LABELS[action]} ${succeeded.length} 篇文章`);
          } else {
            toast.success(
              `完成 ${succeeded.length} 篇，跳过 ${skipped.length} 篇，失败 ${failed.length} 篇`,
            );
          }
          setPendingConfirm(null);
          setSelectedIds(new Set());
          fetchArticles();
          return;
        }
        toast.error(json.error || "批量操作失败");
      }
    } catch {
      toast.error("网络错误，请重试");
    }
    setPendingConfirm(null);
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

      <ArticleFilterBar
        search={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        categories={categories}
        onSearchChange={(v) => {
          setSearch(v);
          setPagination((p) => ({ ...p, page: 1 }));
          setSelectedIds(new Set());
        }}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPagination((p) => ({ ...p, page: 1 }));
          setSelectedIds(new Set());
        }}
        onCategoryChange={(v) => {
          setCategoryFilter(v);
          setPagination((p) => ({ ...p, page: 1 }));
          setSelectedIds(new Set());
        }}
      />

      <ArticleBulkToolbar
        selectedCount={selectedIds.size}
        onPublish={() =>
          setPendingConfirm({
            type: "bulk",
            action: "publish",
            ids: Array.from(selectedIds),
          })
        }
        onArchive={() =>
          setPendingConfirm({
            type: "bulk",
            action: "archive",
            ids: Array.from(selectedIds),
          })
        }
        onDelete={() =>
          setPendingConfirm({
            type: "bulk",
            action: "delete",
            ids: Array.from(selectedIds),
          })
        }
        onClear={() => setSelectedIds(new Set())}
      />

      <ArticleTable
        articles={articles}
        selectedIds={selectedIds}
        loading={loading}
        onToggleSelectAll={toggleSelectAll}
        onToggleSelectOne={toggleSelectOne}
        onTogglePublish={handleTogglePublish}
        onToggleSticky={handleToggleSticky}
        onDelete={handleDelete}
        openMenuId={openMenuId}
        onOpenMenu={setOpenMenuId}
        containerRefs={containerRefs}
      />

      <PaginationBar
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrev={() => {
          setPagination((p) => ({ ...p, page: p.page - 1 }));
          setSelectedIds(new Set());
        }}
        onNext={() => {
          setPagination((p) => ({ ...p, page: p.page + 1 }));
          setSelectedIds(new Set());
        }}
      />

      {pendingConfirm && (
        <ConfirmDialog
          open
          {...getConfirmDialogProps(pendingConfirm)}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
