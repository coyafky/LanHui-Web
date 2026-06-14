"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ArticleContent } from "@/components/ArticleContent";

const CATEGORIES = [
  { value: "品牌动态", label: "品牌动态" },
  { value: "门店动态", label: "门店动态" },
  { value: "产品动态", label: "产品动态" },
  { value: "公司公告", label: "公司公告" },
];

export { CATEGORIES };

interface ArticleEditorProps {
  // Fields
  title: string;
  onTitleChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  excerpt: string;
  onExcerptChange: (v: string) => void;
  content: string;
  onContentChange: (v: string) => void;
  featuredImage: string;
  onFeaturedImageChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  tags: string[];
  onTagsChange: (v: string[]) => void;
  status: "draft" | "published" | "archived";
  onStatusChange: (v: "draft" | "published" | "archived") => void;
  isSticky: boolean;
  onIsStickyChange: (v: boolean) => void;
  // Options
  showArchived?: boolean;
  autoSlug?: boolean;
}

export function ArticleEditor({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  excerpt,
  onExcerptChange,
  content,
  onContentChange,
  featuredImage,
  onFeaturedImageChange,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  status,
  onStatusChange,
  isSticky,
  onIsStickyChange,
  showArchived = false,
  autoSlug = false,
}: ArticleEditorProps) {
  const [tagInput, setTagInput] = useState("");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!autoSlug);

  function handleTitleChange(value: string) {
    onTitleChange(value);
    if (autoSlug && !slugManuallyEdited) {
      const timestamp = Date.now().toString(36);
      const sanitized = value
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 40);
      onSlugChange(sanitized ? `${sanitized}-${timestamp}` : `article-${timestamp}`);
    }
  }

  function handleSlugChange(value: string) {
    onSlugChange(value);
    setSlugManuallyEdited(true);
  }

  function handleAddTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          标题 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="输入文章标题"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-lg text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
          required
        />
      </div>

      {/* Slug */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Slug
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="自动生成，可手动编辑"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
        />
      </div>

      {/* 摘要 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          摘要
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="简短描述文章内容..."
          rows={2}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
        />
      </div>

      {/* 内容 — 编辑/预览 切换 */}
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            内容 <span className="text-red-400">*</span>
          </label>
          {/* Mobile tab switcher */}
          <div className="flex rounded-lg border border-zinc-800 overflow-hidden sm:hidden">
            <button
              type="button"
              onClick={() => setPreviewMode("edit")}
              className={`px-3 py-1 text-xs font-medium ${previewMode === "edit" ? "bg-orange-500 text-white" : "bg-zinc-900 text-zinc-400"}`}
            >
              编辑
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("preview")}
              className={`px-3 py-1 text-xs font-medium ${previewMode === "preview" ? "bg-orange-500 text-white" : "bg-zinc-900 text-zinc-400"}`}
            >
              预览
            </button>
          </div>
        </div>

        {/* Desktop: side by side; Mobile: tab switch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Editor pane */}
          <div className={previewMode === "preview" ? "hidden sm:block" : ""}>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="输入文章内容（支持 Markdown）"
              rows={20}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
              required
            />
          </div>

          {/* Preview pane */}
          <div
            className={`rounded-lg border border-zinc-800 bg-zinc-900 p-4 overflow-y-auto max-h-[540px] ${previewMode === "edit" ? "hidden sm:block" : ""}`}
          >
            {content ? (
              <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed">
                <ArticleContent content={content} />
              </div>
            ) : (
              <p className="text-sm text-zinc-600 italic">输入内容后可预览效果...</p>
            )}
          </div>
        </div>
      </div>

      {/* 封面图 + 分类 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            封面图 URL
          </label>
          <input
            type="text"
            value={featuredImage}
            onChange={(e) => onFeaturedImageChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            分类
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none focus:border-orange-500"
          >
            <option value="">选择分类</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 标签 */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          标签
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="输入标签后按回车添加"
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            添加
          </button>
        </div>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 状态 + 置顶 */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            状态
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="draft"
                checked={status === "draft"}
                onChange={() => onStatusChange("draft")}
                className="accent-orange-500"
              />
              <span className="text-sm text-zinc-300">草稿</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                value="published"
                checked={status === "published"}
                onChange={() => onStatusChange("published")}
                className="accent-orange-500"
              />
              <span className="text-sm text-zinc-300">发布</span>
            </label>
            {showArchived && (
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="status"
                  value="archived"
                  checked={status === "archived"}
                  onChange={() => onStatusChange("archived")}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">归档</span>
              </label>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            置顶
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isSticky}
              onChange={(e) => onIsStickyChange(e.target.checked)}
              className="accent-orange-500"
            />
            <span className="text-sm text-zinc-300">置顶文章</span>
          </label>
        </div>
      </div>
    </div>
  );
}
