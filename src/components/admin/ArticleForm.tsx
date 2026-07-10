"use client";

import { useRef, useEffect } from "react";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";
import { TitleSlugFields } from "@/components/admin/articles/TitleSlugFields";
import { ContentEditor } from "@/components/admin/articles/ContentEditor";
import { TagInput } from "@/components/admin/articles/TagInput";
import { MetaFields } from "@/components/admin/articles/MetaFields";

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

  function setFieldRef(field: string, el: HTMLElement | null) {
    fieldRefs.current[field] = el;
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit?.(e);
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <TitleSlugFields
        title={title}
        slug={slug}
        onTitleChange={onTitleChange}
        onSlugChange={onSlugChange}
        autoSlug={autoSlug}
        slugManuallyEdited={slugManuallyEdited}
        fieldErrors={fieldErrors}
        setFieldRef={setFieldRef}
      />

      <ContentEditor
        content={content}
        onContentChange={onContentChange}
        fieldErrors={fieldErrors}
        setFieldRef={setFieldRef}
      />

      <MetaFields
        excerpt={excerpt}
        onExcerptChange={onExcerptChange}
        featuredImage={featuredImage}
        onFeaturedImageChange={onFeaturedImageChange}
        category={category}
        onCategoryChange={onCategoryChange}
        categories={categories}
        status={status}
        onStatusChange={onStatusChange}
        isSticky={isSticky}
        onIsStickyChange={onIsStickyChange}
        fieldErrors={fieldErrors}
        setFieldRef={setFieldRef}
        mode={mode}
      />

      <TagInput
        tags={tags}
        onTagsChange={onTagsChange}
        fieldErrors={fieldErrors}
        setFieldRef={setFieldRef}
      />

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
