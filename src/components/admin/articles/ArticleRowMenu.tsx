"use client";

import { MoreVertical, Eye, EyeOff, Pencil, Trash2, Pin, PinOff } from "lucide-react";
import type { Article } from "@/components/admin/shared/types";

interface ArticleRowMenuProps {
  article: Article;
  open: boolean;
  onTogglePublish: () => void;
  onToggleSticky: () => void;
  onDelete: () => void;
  onClose: () => void;
  containerRef: (el: HTMLDivElement | null) => void;
}

export function ArticleRowMenu({
  article,
  open,
  onTogglePublish,
  onToggleSticky,
  onDelete,
  onClose,
  containerRef,
}: ArticleRowMenuProps) {
  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-xl">
          <a
            href={`/admin/articles/${article.id}`}
            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Pencil className="h-4 w-4" />
            编辑
          </a>

          <button
            type="button"
            onClick={() => {
              onTogglePublish();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            {article.status === "published" ? (
              <>
                <EyeOff className="h-4 w-4" />
                取消发布
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                发布
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleSticky();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            {article.isSticky ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
            {article.isSticky ? "取消置顶" : "置顶"}
          </button>

          <button
            type="button"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-zinc-800"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </button>
        </div>
      )}
    </div>
  );
}
