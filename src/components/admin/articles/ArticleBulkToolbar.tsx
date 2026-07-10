"use client";

interface ArticleBulkToolbarProps {
  selectedCount: number;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function ArticleBulkToolbar({
  selectedCount,
  onPublish,
  onArchive,
  onDelete,
  onClear,
}: ArticleBulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-orange-900/50 bg-orange-950/30 px-4 py-3">
      <span className="text-sm text-orange-400">
        已选 <span className="font-semibold">{selectedCount}</span> 篇
      </span>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onPublish}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          批量发布
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-yellow-700"
        >
          批量归档
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
        >
          批量删除
        </button>
        <button
          type="button"
          onClick={onClear}
          className="ml-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          取消选择
        </button>
      </div>
    </div>
  );
}
