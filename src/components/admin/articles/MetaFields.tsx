"use client";

import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";

interface CategoryOption {
  value: string;
  label: string;
  count?: number;
}

interface MetaFieldsProps {
  excerpt: string;
  onExcerptChange: (v: string) => void;
  featuredImage: string;
  onFeaturedImageChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  categories: CategoryOption[];
  status: ArticleStatus;
  onStatusChange: (v: ArticleStatus) => void;
  isSticky: boolean;
  onIsStickyChange: (v: boolean) => void;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  setFieldRef: (field: string, el: HTMLElement | null) => void;
  mode: "create" | "edit";
}

const baseInputClass =
  "w-full rounded-lg border bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500";

export function MetaFields({
  excerpt,
  onExcerptChange,
  featuredImage,
  onFeaturedImageChange,
  category,
  onCategoryChange,
  categories,
  status,
  onStatusChange,
  isSticky,
  onIsStickyChange,
  fieldErrors,
  setFieldRef,
  mode,
}: MetaFieldsProps) {
  function fieldBorderClass(field: keyof ArticleFormInput): string {
    return fieldErrors[field] ? "border-red-500" : "border-zinc-800";
  }

  const statusOptions: { value: ArticleStatus; label: string }[] = [
    { value: "draft", label: "草稿" },
    { value: "published", label: "发布" },
  ];
  if (mode === "edit") {
    statusOptions.push({ value: "archived", label: "归档" });
  }

  return (
    <>
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
        {fieldErrors["excerpt"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors["excerpt"]}
          </p>
        )}
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
        {fieldErrors["featuredImage"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors["featuredImage"]}
          </p>
        )}
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
        {fieldErrors["category"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors["category"]}
          </p>
        )}
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
          {fieldErrors["status"] && (
            <p className="mt-1 text-xs text-red-400" role="alert">
              {fieldErrors["status"]}
            </p>
          )}
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
    </>
  );
}
