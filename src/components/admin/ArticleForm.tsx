"use client";

import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import { ArticleContent } from "@/components/ArticleContent";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";

export interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

export const FIELD_ORDER: (keyof ArticleFormInput)[] = [
  "title",
  "slug",
  "excerpt",
  "content",
  "featuredImage",
  "category",
  "tags",
  "status",
];

interface ArticleFormProps {
  mode: "create" | "edit";
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
  status: ArticleStatus;
  onStatusChange: (v: ArticleStatus) => void;
  isSticky: boolean;
  onIsStickyChange: (v: boolean) => void;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  saving: boolean;
  categories: CategoryOption[];
  slugManuallyEdited?: boolean;
  autoSlug?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

export function ArticleForm({
  mode,
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
  fieldErrors,
  saving,
  categories,
  slugManuallyEdited = false,
  autoSlug = false,
  onSubmit,
}: ArticleFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [localSlugManuallyEdited, setLocalSlugManuallyEdited] =
    useState(slugManuallyEdited);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  const fieldRefs = useRef<Record<string, HTMLElement | null>>({});

  // Auto-focus first error field
  useEffect(() => {
    const firstErrorField = FIELD_ORDER.find((field) => fieldErrors[field]);
    if (firstErrorField) {
      const el = fieldRefs.current[firstErrorField];
      if (el && typeof el.focus === "function") {
        el.focus();
      }
    }
  }, [fieldErrors]);

  function handleTitleChange(value: string) {
    onTitleChange(value);
    if (autoSlug && !localSlugManuallyEdited) {
      const timestamp = Date.now().toString(36);
      const sanitized = value
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()
        .slice(0, 40);
      onSlugChange(
        sanitized
          ? `${sanitized}-${timestamp}`
          : `article-${timestamp}`,
      );
    }
  }

  function handleSlugChange(value: string) {
    onSlugChange(value);
    if (!localSlugManuallyEdited) {
      setLocalSlugManuallyEdited(true);
    }
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

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(e);
  }

  function setFieldRef(field: string, el: HTMLElement | null) {
    fieldRefs.current[field] = el;
  }

  function fieldBorderClass(field: keyof ArticleFormInput): string {
    return fieldErrors[field] ? "border-red-500" : "border-zinc-800";
  }

  const baseInputClass =
    "w-full rounded-lg border bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500";

  function renderFieldError(field: keyof ArticleFormInput) {
    if (!fieldErrors[field]) return null;
    return (
      <p className="mt-1 text-xs text-red-400" role="alert">
        {fieldErrors[field]}
      </p>
    );
  }

  const statusOptions: { value: ArticleStatus; label: string }[] = [
    { value: "draft", label: "草稿" },
    { value: "published", label: "发布" },
  ];
  if (mode === "edit") {
    statusOptions.push({ value: "archived", label: "归档" });
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label
          htmlFor="article-title"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          标题 <span className="text-red-400">*</span>
        </label>
        <input
          ref={(el) => setFieldRef("title", el)}
          id="article-title"
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="输入文章标题"
          className={`${baseInputClass} ${fieldBorderClass("title")} text-lg`}
          required
        />
        {renderFieldError("title")}
      </div>

      {/* Slug */}
      <div>
        <label
          htmlFor="article-slug"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          Slug
        </label>
        <input
          ref={(el) => setFieldRef("slug", el)}
          id="article-slug"
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="自动生成，可手动编辑"
          className={`${baseInputClass} ${fieldBorderClass("slug")}`}
        />
        {renderFieldError("slug")}
      </div>

      {/* Excerpt */}
      <div>
        <label
          htmlFor="article-excerpt"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          摘要
        </label>
        <textarea
          ref={(el) => setFieldRef("excerpt", el)}
          id="article-excerpt"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          placeholder="简短描述文章内容..."
          rows={2}
          className={`${baseInputClass} ${fieldBorderClass("excerpt")}`}
        />
        {renderFieldError("excerpt")}
      </div>

      {/* Featured Image */}
      <div>
        <label
          htmlFor="article-featured-image"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          封面图路径
        </label>
        <input
          ref={(el) => setFieldRef("featuredImage", el)}
          id="article-featured-image"
          type="text"
          value={featuredImage}
          onChange={(e) => onFeaturedImageChange(e.target.value)}
          placeholder="/images/articles/xxx.webp"
          className={`${baseInputClass} ${fieldBorderClass("featuredImage")}`}
        />
        {renderFieldError("featuredImage")}
      </div>

      {/* Content - dual pane */}
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
        {renderFieldError("content")}
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="article-category"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          分类
        </label>
        <select
          ref={(el) => setFieldRef("category", el)}
          id="article-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`${baseInputClass} ${fieldBorderClass("category")}`}
        >
          <option value="">选择分类</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
              {typeof cat.count === "number" ? ` (${cat.count})` : ""}
            </option>
          ))}
        </select>
        {renderFieldError("category")}
      </div>

      {/* Tags */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          标签
        </label>
        <div className="flex gap-2">
          <input
            ref={(el) => setFieldRef("tags", el)}
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
        {renderFieldError("tags")}
      </div>

      {/* Status + Sticky */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            状态
          </label>
          <div className="flex gap-4">
            {statusOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-center gap-2"
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={status === opt.value}
                  onChange={() => onStatusChange(opt.value)}
                  className="accent-orange-500"
                />
                <span className="text-sm text-zinc-300">{opt.label}</span>
              </label>
            ))}
          </div>
          {renderFieldError("status")}
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

      {/* Submit */}
      <div className="flex items-center gap-4 border-t border-zinc-800 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
    </form>
  );
}
