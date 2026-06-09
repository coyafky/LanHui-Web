"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Store,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface StoreRow {
  id: string;
  name: string;
  provinceLabel: string;
  cityLabel: string;
  phone: string;
  isActive: boolean;
}

interface ProvinceOption {
  slug: string;
  label: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-600/30 text-zinc-500"
      )}
    >
      {isActive ? "营业中" : "已停用"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Dialog                                         */
/* ------------------------------------------------------------------ */

function DeleteDialog({
  open,
  onClose,
  onConfirm,
  storeName,
  deleting,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  storeName: string;
  deleting: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="mx-4 w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-100">确认删除</h3>
        <p className="mt-2 text-sm text-zinc-400">
          确定要删除门店「{storeName}」吗？此操作将停用该门店，可后续恢复。
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
          >
            {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            {["门店名称", "省份", "城市", "电话", "状态", "操作"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-zinc-500"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-zinc-800/50",
                i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
              )}
            >
              {Array.from({ length: 6 }).map((_, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 w-24 animate-pulse rounded bg-zinc-700" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function StoresPage() {
  // Data state
  const [stores, setStores] = useState<StoreRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);

  // Filter state
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [page, setPage] = useState(1);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<StoreRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---------- Fetch stores ---------- */
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      params.set("all", "true");
      if (search) params.set("search", search);
      if (provinceFilter) params.set("province", provinceFilter);

      const res = await fetch(`/api/stores?${params}`);
      const json = await res.json();
      if (json.success) {
        setStores(json.data);
        setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, provinceFilter]);

  /* ---------- Fetch provinces for filter ---------- */
  useEffect(() => {
    fetch("/api/provinces")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setProvinces(
            res.data.map((p: { slug: string; label: string }) => ({
              slug: p.slug,
              label: p.label,
            }))
          );
        }
      });
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  /* ---------- Delete handler ---------- */
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stores/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        fetchStores();
      }
    } finally {
      setDeleting(false);
    }
  }

  /* ---------- Search with debounce ---------- */
  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ---------- Table definition ---------- */
  const columns: ColumnDef<StoreRow>[] = [
    {
      accessorKey: "name",
      header: "门店名称",
      cell: ({ getValue }) => (
        <span className="font-medium text-zinc-100">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "provinceLabel",
      header: "省份",
    },
    {
      accessorKey: "cityLabel",
      header: "城市",
    },
    {
      accessorKey: "phone",
      header: "电话",
    },
    {
      accessorKey: "isActive",
      header: "状态",
      cell: ({ getValue }) => (
        <StatusBadge isActive={getValue() as boolean} />
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/stores/${row.original.id}`}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            编辑
          </Link>
          <button
            type="button"
            onClick={() => setDeleteTarget(row.original)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            删除
          </button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: stores,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-zinc-100">门店管理</h1>
          <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
            {pagination.total} 家
          </span>
        </div>
        <Link
          href="/admin/stores/new"
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          新建门店
        </Link>
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索门店名称或地址..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Province filter */}
        <select
          value={provinceFilter}
          onChange={(e) => {
            setProvinceFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
        >
          <option value="">全部省份</option>
          {provinces.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <TableSkeleton />
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 py-16">
          <Store className="mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-sm text-zinc-500">暂无门店数据</p>
          <Link
            href="/admin/stores/new"
            className="mt-4 text-sm font-medium text-orange-500 hover:text-orange-400"
          >
            创建第一家门店
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="border-b border-zinc-800 bg-zinc-900"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/80",
                    i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/50"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-zinc-300"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            第 {pagination.page} / {pagination.totalPages} 页，共{" "}
            {pagination.total} 条
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete Dialog ── */}
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        storeName={deleteTarget?.name ?? ""}
        deleting={deleting}
      />
    </div>
  );
}
