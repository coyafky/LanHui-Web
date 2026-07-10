"use client";

import type { CategoryOption } from "@/components/admin/shared/types";
import { STATUS_OPTIONS } from "@/components/admin/shared/types";

interface ArticleFilterBarProps {
  search: string;
  statusFilter: string;
  categoryFilter: string;
  categories: CategoryOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function ArticleFilterBar({
  search,
  statusFilter,
  categoryFilter,
  categories,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
}: ArticleFilterBarProps) {
  const inputClass =
    "rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="搜索标题..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`${inputClass} min-w-[200px] flex-1`}
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className={inputClass}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className={inputClass}
      >
        <option value="">全部分类</option>
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
            {c.count !== undefined ? ` (${c.count})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
