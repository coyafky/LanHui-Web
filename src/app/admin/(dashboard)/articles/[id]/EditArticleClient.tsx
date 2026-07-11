"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { useCategories } from "@/hooks/use-categories";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useArticleFormState } from "@/hooks/use-article-form-state";
import type { ArticleFormInput } from "@/lib/validations/article";

export function EditArticleClient({
  initialArticle,
  id,
}: {
  initialArticle: ArticleFormInput;
  id: string;
}) {
  const router = useRouter();
  const { categories } = useCategories();

  const formState = useArticleFormState("edit", {
    initialData: initialArticle,
    articleId: id,
  });

  const { confirmLeave, confirmDialogProps } = useUnsavedChangesGuard(
    formState.dirty,
    formState.saving,
  );

  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (formState.dirty) {
        e.preventDefault();
        confirmLeave(() => router.push("/admin/articles"));
      }
    },
    [formState.dirty, confirmLeave, router],
  );

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/articles"
          onClick={handleNavigation}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">编辑文章</h1>
      </div>

      <ArticleForm
        mode="edit"
        title={formState.title}
        onTitleChange={formState.onTitleChange}
        slug={formState.slug}
        onSlugChange={formState.onSlugChange}
        excerpt={formState.excerpt}
        onExcerptChange={formState.onExcerptChange}
        content={formState.content}
        onContentChange={formState.onContentChange}
        featuredImage={formState.featuredImage}
        onFeaturedImageChange={formState.onFeaturedImageChange}
        category={formState.category}
        onCategoryChange={formState.onCategoryChange}
        tags={formState.tags}
        onTagsChange={formState.onTagsChange}
        status={formState.status}
        onStatusChange={formState.onStatusChange}
        isSticky={formState.isSticky}
        onIsStickyChange={formState.onIsStickyChange}
        fieldErrors={formState.fieldErrors}
        saving={formState.saving}
        categories={categories}
        slugManuallyEdited={formState.slugManuallyEdited}
        onSubmit={formState.handleSubmit}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
