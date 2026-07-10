"use client";

import { useState } from "react";
import { ArticleContent } from "@/components/ArticleContent";
import type { ArticleFormInput } from "@/lib/validations/article";

interface ContentEditorProps {
  content: string;
  onContentChange: (v: string) => void;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  setFieldRef: (field: string, el: HTMLElement | null) => void;
}

const baseInputClass =
  "w-full rounded-lg border bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500";

export function ContentEditor({
  content,
  onContentChange,
  fieldErrors,
  setFieldRef,
}: ContentEditorProps) {
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  function fieldBorderClass(field: keyof ArticleFormInput): string {
    return fieldErrors[field] ? "border-red-500" : "border-zinc-800";
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">
        内容 <span className="text-red-400">*</span>
      </label>

      {/* Mobile toggle */}
      <div className="mb-2 flex gap-2 md:hidden">
        <button
          type="button"
          onClick={() => setPreviewMode("edit")}
          className={
            previewMode === "edit"
              ? "rounded bg-orange-500 px-3 py-1 text-xs text-white"
              : "rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
          }
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setPreviewMode("preview")}
          className={
            previewMode === "preview"
              ? "rounded bg-orange-500 px-3 py-1 text-xs text-white"
              : "rounded bg-zinc-800 px-3 py-1 text-xs text-zinc-400"
          }
        >
          预览
        </button>
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-4">
        <textarea
          ref={(el) => setFieldRef("content", el)}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="输入文章内容（支持 Markdown）"
          rows={20}
          className={`${baseInputClass} ${fieldBorderClass("content")} font-mono ${previewMode === "preview" ? "hidden md:block" : ""}`}
          required
        />
        <div
          className={
            previewMode === "edit"
              ? "hidden rounded-lg border border-zinc-800 bg-zinc-900 p-4 md:block"
              : "rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          }
        >
          <ArticleContent content={content} />
        </div>
      </div>
      {fieldErrors["content"] && (
        <p className="mt-1 text-xs text-red-400" role="alert">
          {fieldErrors["content"]}
        </p>
      )}
    </div>
  );
}
