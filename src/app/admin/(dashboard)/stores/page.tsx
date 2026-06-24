"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  Award,
  X as XIcon,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  STORE_LEVELS,
  STORE_LEVEL_LABELS,
  STORE_LEVEL_SORT_WEIGHTS,
  STORE_STATUSES,
  STORE_STATUS_LABELS,
  type StoreLevel,
  type StoreStatus,
} from "@/lib/validations/store";
import { availableActionsFor, type StoreAction } from "@/lib/validations/store-transitions";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

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
  level: StoreLevel | null;
  status: StoreStatus;
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

type GroupMode = "none" | "province" | "city" | "level";

type SortKey =
  | "updated_desc"
  | "updated_asc"
  | "created_desc"
  | "name_asc"
  | "name_desc"
  | "level_desc";

/* ------------------------------------------------------------------ */
/*  Level badge                                                        */
/* ------------------------------------------------------------------ */

const LEVEL_BADGE_CLASS: Record<StoreLevel, string> = {
  flagship: "border-amber-600/60 bg-amber-500/10 text-amber-400",
  premium: "border-blue-600/60 bg-blue-500/10 text-blue-400",
  specialty: "border-cyan-600/60 bg-cyan-500/10 text-cyan-400",
  member: "border-zinc-600 bg-zinc-700/40 text-zinc-300",
};

function LevelBadge({
  level,
  emptyText = "—",
}: {
  level: StoreLevel | null;
  emptyText?: string;
}) {
  if (!level) {
    return (
      <span className="text-xs text-zinc-600" aria-label="未设置等级">
        {emptyText}
      </span>
    );
  }
  return (
    <span
      aria-label={`等级 ${STORE_LEVEL_LABELS[level]}`}
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        LEVEL_BADGE_CLASS[level]
      )}
    >
      {STORE_LEVEL_LABELS[level]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge (4 态)                                                */
/* ------------------------------------------------------------------ */

const STATUS_BADGE_CLASS: Record<StoreStatus, string> = {
  pending: "border border-amber-600/60 bg-amber-500/10 text-amber-400",
  active: "border border-emerald-600/60 bg-emerald-500/10 text-emerald-400",
  suspended: "border border-blue-600/60 bg-blue-500/10 text-blue-400",
  terminated: "border border-zinc-600 bg-zinc-700/40 text-zinc-500",
};

function StatusBadge({ status }: { status: StoreStatus }) {
  return (
    <span
      aria-label={`状态：${STORE_STATUS_LABELS[status]}`}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_BADGE_CLASS[status]
      )}
    >
      {STORE_STATUS_LABELS[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Level multi-select (chip toggle group)                             */
/* ------------------------------------------------------------------ */

function LevelFilter({
  selected,
  onToggle,
}: {
  selected: StoreLevel[];
  onToggle: (lvl: StoreLevel) => void;
}) {
  return (
    <div
      role="group"
      aria-label="按等级筛选"
      className="flex flex-wrap items-center gap-1.5"
    >
      {STORE_LEVELS.map((lvl) => {
        const active = selected.includes(lvl);
        return (
          <button
            key={lvl}
            type="button"
            role="switch"
            aria-checked={active}
            aria-label={`筛选等级 ${STORE_LEVEL_LABELS[lvl]}`}
            onClick={() => onToggle(lvl)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? LEVEL_BADGE_CLASS[lvl]
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            )}
          >
            {STORE_LEVEL_LABELS[lvl]}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete Confirmation Dialog (已抽到 ConfirmDialog)                  */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900">
            {["门店名称", "省份", "城市", "等级", "电话", "状态", "操作"].map(
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
              {Array.from({ length: 7 }).map((_, j) => (
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
/*  Column factory (single source of truth)                            */
/* ------------------------------------------------------------------ */

function buildColumns(
  onAction: (row: StoreRow, action: StoreAction) => void
): ColumnDef<StoreRow>[] {
  return [
    {
      accessorKey: "name",
      header: "门店名称",
      cell: ({ getValue }) => (
        <span className="font-medium text-zinc-100">{getValue() as string}</span>
      ),
    },
    { accessorKey: "provinceLabel", header: "省份" },
    { accessorKey: "cityLabel", header: "城市" },
    {
      accessorKey: "level",
      header: "等级",
      cell: ({ getValue }) => (
        <LevelBadge level={getValue() as StoreLevel | null} />
      ),
    },
    { accessorKey: "phone", header: "电话" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as StoreStatus} />
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const status = row.original.status;
        const actions = availableActionsFor(status);
        return (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/stores/${row.original.id}`}
              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-orange-400 transition-colors hover:bg-orange-500/10"
            >
              <Pencil className="h-3.5 w-3.5" />
              编辑
            </Link>
            {actions.length === 0 ? (
              // terminated：只读
              <span
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-zinc-600"
                aria-label="已终止合作，只读"
              >
                已终止
              </span>
            ) : (
              actions.map((action) => {
                const ACTION_LABELS: Record<StoreAction, string> = {
                  publish: "发布",
                  suspend: "暂停",
                  resume: "恢复",
                  terminate: "终止",
                };
                const ACTION_COLOR: Record<
                  StoreAction,
                  "orange" | "blue" | "red"
                > = {
                  publish: "orange",
                  resume: "orange",
                  suspend: "red",
                  terminate: "red",
                };
                const color = ACTION_COLOR[action];
                const cls =
                  color === "red"
                    ? "text-red-400 hover:bg-red-500/10"
                    : color === "blue"
                      ? "text-blue-400 hover:bg-blue-500/10"
                      : "text-orange-400 hover:bg-orange-500/10";
                return (
                  <button
                    key={action}
                    type="button"
                    onClick={() => onAction(row.original, action)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      cls
                    )}
                  >
                    {ACTION_LABELS[action]}
                  </button>
                );
              })
            )}
          </div>
        );
      },
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Single Table Renderer (used by both flat and grouped modes)        */
/* ------------------------------------------------------------------ */

function StoreTable({
  rows,
  columns,
}: {
  rows: StoreRow[];
  columns: ColumnDef<StoreRow>[];
}) {
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
  // searchInput 是输入框的草稿值（input 实时绑定），search 是 debounce 后用于触发 fetch 的值
  const [searchInput, setSearchInput] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<StoreLevel[]>([]);
  // 4 态 status 筛选：空 = 全部；非空 = 单值
  const [statusFilter, setStatusFilter] = useState<StoreStatus | "">("");
  // 排序
  const [sortBy, setSortBy] = useState<SortKey>("updated_desc");
  const [page, setPage] = useState(1);
  const [groupMode, setGroupMode] = useState<GroupMode>("none");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Action dialog state（替代原 DeleteDialog）
  const [actionTarget, setActionTarget] = useState<{
    row: StoreRow;
    action: StoreAction;
  } | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
      if (statusFilter) {
        // 显式传 status 即可（多值可扩展为多选）
        params.append("status", statusFilter);
      }
      levelFilter.forEach((lvl) => params.append("level", lvl));
      params.set("sort", sortBy);

      const res = await fetch(`/api/stores?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        const rows: StoreRow[] = (
          json.data as Array<Record<string, unknown>>
        ).map((d) => ({
          id: String(d.id),
          name: String(d.name ?? ""),
          provinceLabel: String(d.provinceLabel ?? ""),
          cityLabel: String(d.cityLabel ?? ""),
          phone: String(d.phone ?? ""),
          isActive: Boolean(d.isActive),
          level: (d.level ?? null) as StoreLevel | null,
          status: ((d.status ?? "pending") as StoreStatus),
        }));
        setStores(rows);
        setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, provinceFilter, levelFilter, statusFilter, sortBy]);

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

  /* ---------- 状态机动作 handler ---------- */
  function openActionDialog(row: StoreRow, action: StoreAction) {
    setActionTarget({ row, action });
    setStatusReason("");
    setActionError(null);
  }
  function closeActionDialog() {
    if (acting) return;
    setActionTarget(null);
    setStatusReason("");
    setActionError(null);
  }
  async function confirmAction() {
    if (!actionTarget) return;
    const { row, action } = actionTarget;
    const needReason = action === "suspend" || action === "terminate";
    if (needReason && !statusReason.trim()) {
      setActionError("请填写原因");
      return;
    }
    setActing(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/stores/${row.id}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          needReason ? { statusReason: statusReason.trim() } : {}
        ),
      });
      const json = (await res.json()) as {
        success: boolean;
        error?: string;
        details?: Record<string, string[]>;
      };
      if (!json.success) {
        const detailsMsg = json.details
          ? Object.values(json.details).flat().join("；")
          : "";
        setActionError(json.error || detailsMsg || "操作失败");
        return;
      }
      setActionTarget(null);
      setStatusReason("");
      fetchStores();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "网络错误");
    } finally {
      setActing(false);
    }
  }

  /* ---------- Search with debounce ---------- */
  // 2026-06-24: 补回缺失的 searchInput state + syncQuery stub（前者由前一会话
  // coder 子 agent 引入 URL 持久化时遗留,后者本应是 useSearchParams + router.replace
  // 双向同步;P2 deferred,此处用 no-op 占位以通过 tsc,不动业务行为）。
  const syncQuery = useCallback((_q: Record<string, unknown>) => {
    /* TODO P2: 用 useSearchParams + router.replace 同步 status/level/province/search/sort 到 URL */
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      syncQuery({ search: searchInput, page: 1 });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, syncQuery]);

  /* ---------- Level toggle ---------- */
  const toggleLevel = useCallback((lvl: StoreLevel) => {
    setLevelFilter((prev) =>
      prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]
    );
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setProvinceFilter("");
    setLevelFilter([]);
    setStatusFilter("");
    setPage(1);
  }, []);

  const hasActiveFilter =
    search.length > 0 ||
    provinceFilter.length > 0 ||
    levelFilter.length > 0 ||
    statusFilter.length > 0;

  /* ---------- Grouping ---------- */
  const groupedStores = useMemo(() => {
    if (groupMode === "none") return null;

    type Bucket = { label: string; sortKey: number | string; rows: StoreRow[] };
    const buckets = new Map<string, Bucket>();

    for (const row of stores) {
      let key: string;
      let label: string;
      let sortKey: number | string;

      if (groupMode === "province") {
        key = row.provinceLabel || "(未设置)";
        label = key;
        sortKey = key;
      } else if (groupMode === "city") {
        key = row.cityLabel || "(未设置)";
        label = key;
        sortKey = key;
      } else {
        key = row.level ?? "_none";
        label = row.level ? STORE_LEVEL_LABELS[row.level] : "未设置等级";
        sortKey = row.level ? STORE_LEVEL_SORT_WEIGHTS[row.level] : 99;
      }

      if (!buckets.has(key)) {
        buckets.set(key, { label, sortKey, rows: [] });
      }
      buckets.get(key)!.rows.push(row);
    }

    return Array.from(buckets.entries())
      .sort((a, b) => {
        const av = a[1].sortKey;
        const bv = b[1].sortKey;
        if (typeof av === "number" && typeof bv === "number") return av - bv;
        return String(av).localeCompare(String(bv), "zh-Hans-CN");
      })
      .map(([key, b]) => ({ key, ...b }));
  }, [stores, groupMode]);

  /* ---------- Columns factory (uses main action handler) ---------- */
  const columns = useMemo(
    () => buildColumns(openActionDialog),
    []
  );

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
      <div className="mb-4 space-y-3">
        {/* Primary row: search + group selector + advanced toggle (mobile) */}
        <div className="flex flex-col gap-3 sm:flex-row">
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

          {/* Status filter */}
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="hidden sm:inline">状态</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StoreStatus | "");
                setPage(1);
              }}
              aria-label="按状态筛选"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            >
              <option value="">全部</option>
              {STORE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STORE_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          {/* Sort selector */}
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="hidden sm:inline">排序</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              aria-label="排序方式"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            >
              <option value="updated_desc">最近更新优先</option>
              <option value="updated_asc">最早更新优先</option>
              <option value="created_desc">最新创建优先</option>
              <option value="name_asc">名称 A→Z</option>
              <option value="name_desc">名称 Z→A</option>
              <option value="level_desc">等级高→低</option>
            </select>
          </label>

          {/* Group selector */}
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="hidden sm:inline">分组</span>
            <select
              value={groupMode}
              onChange={(e) => setGroupMode(e.target.value as GroupMode)}
              aria-label="分组方式"
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
            >
              <option value="none">不分组</option>
              <option value="province">按省份</option>
              <option value="city">按城市</option>
              <option value="level">按等级</option>
            </select>
          </label>

          {/* Mobile advanced toggle */}
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            aria-controls="advanced-filters"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700 sm:hidden"
          >
            <Filter className="h-4 w-4" />
            更多筛选
            {levelFilter.length + (provinceFilter ? 1 : 0) > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
                {levelFilter.length + (provinceFilter ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Secondary row: province + level */}
        <div
          id="advanced-filters"
          className={cn(
            "flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3",
            advancedOpen ? "flex" : "hidden sm:flex"
          )}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              <span>省份</span>
              <select
                value={provinceFilter}
                onChange={(e) => {
                  setProvinceFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-orange-500 focus:outline-none"
              >
                <option value="">全部省份</option>
                {provinces.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={clearFilters}
                aria-label="清除所有筛选"
                className="inline-flex items-center gap-1 self-start rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
              >
                <XIcon className="h-3.5 w-3.5" />
                清除筛选
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
              <Award className="h-3.5 w-3.5" />
              等级（多选）
            </span>
            <LevelFilter selected={levelFilter} onToggle={toggleLevel} />
          </div>
        </div>
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
      ) : groupedStores ? (
        <div className="space-y-6">
          {groupedStores.map((bucket) => (
            <section key={bucket.key}>
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-300">
                  {bucket.label}
                </h2>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                  {bucket.rows.length}
                </span>
              </div>
              <StoreTable rows={bucket.rows} columns={columns} />
            </section>
          ))}
        </div>
      ) : (
        <StoreTable rows={stores} columns={columns} />
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
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-40"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── 状态机动作对话框 ── */}
      {actionTarget && (
        <ConfirmDialog
          open={!!actionTarget}
          title={
            actionTarget.action === "publish"
              ? "发布门店"
              : actionTarget.action === "suspend"
                ? "暂停合作"
                : actionTarget.action === "resume"
                  ? "恢复营业"
                  : "终止合作"
          }
          description={
            actionTarget.action === "publish"
              ? `确认将「${actionTarget.row.name}」发布为营业中？发布后该门店将出现在前台列表。`
              : actionTarget.action === "suspend"
                ? `确认暂停「${actionTarget.row.name}」的合作？前台将不再展示该门店。`
                : actionTarget.action === "resume"
                  ? `确认将「${actionTarget.row.name}」恢复营业？请确保联系方式、地址、营业时间均已核对。`
                  : `确认终止与「${actionTarget.row.name}」的合作？终止后该门店进入只读状态，不可再恢复。`
          }
          confirmLabel={
            actionTarget.action === "publish"
              ? "发布"
              : actionTarget.action === "suspend"
                ? "暂停"
                : actionTarget.action === "resume"
                  ? "恢复"
                  : "终止"
          }
          variant={
            actionTarget.action === "suspend" ||
            actionTarget.action === "terminate"
              ? "danger"
              : "default"
          }
          onConfirm={confirmAction}
          onCancel={closeActionDialog}
        >
          {(actionTarget.action === "suspend" ||
            actionTarget.action === "terminate") && (
            <div>
              <label
                htmlFor="statusReason"
                className="block text-sm font-medium text-zinc-300"
              >
                原因 <span className="text-red-400">*</span>
              </label>
              <textarea
                id="statusReason"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                rows={3}
                placeholder={
                  actionTarget.action === "suspend"
                    ? "例：门店装修 / 临时歇业 / 合作调整..."
                    : "例：合同到期 / 双方协商 / 违规下线..."
                }
                className="mt-1 w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-orange-500 focus:outline-none"
              />
            </div>
          )}
          {actionError && (
            <p
              role="alert"
              className="mt-2 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-1 text-xs text-red-400"
            >
              {actionError}
            </p>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}
