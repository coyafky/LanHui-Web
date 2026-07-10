"use client";

import { useState } from "react";
import type { ArticleFormInput } from "@/lib/validations/article";

interface TitleSlugFieldsProps {
  title: string;
  slug: string;
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  autoSlug?: boolean;
  slugManuallyEdited?: boolean;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
  setFieldRef: (field: string, el: HTMLElement | null) => void;
}

const baseInputClass =
  "w-full rounded-lg border bg-zinc-900 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-orange-500";

export function TitleSlugFields({
  title,
  slug,
  onTitleChange,
  onSlugChange,
  autoSlug = false,
  slugManuallyEdited = false,
  fieldErrors,
  setFieldRef,
}: TitleSlugFieldsProps) {
  const [userEditedSlug, setUserEditedSlug] = useState(false);
  const localSlugManuallyEdited = slugManuallyEdited || userEditedSlug;

  function fieldBorderClass(field: keyof ArticleFormInput): string {
    return fieldErrors[field] ? "border-red-500" : "border-zinc-800";
  }

  function handleTitleChange(value: string) {
    onTitleChange(value);
    if (autoSlug && !localSlugManuallyEdited) {
      const timestamp = Date.now().toString(36);
      const sanitized = value
        .replace(/[^a-zA-Z0-9\s-]/g, "")
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
      setUserEditedSlug(true);
    }
  }

  return (
    <>
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
        {fieldErrors["title"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors["title"]}
          </p>
        )}
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
        {fieldErrors["slug"] && (
          <p className="mt-1 text-xs text-red-400" role="alert">
            {fieldErrors["slug"]}
          </p>
        )}
      </div>
    </>
  );
}
