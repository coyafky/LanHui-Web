"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useCategories } from "@/hooks/use-categories";
import { useArticleFormState } from "@/hooks/use-article-form-state";

export default function NewArticlePage() {
  const router = useRouter();
  const { categories } = useCategories();
  const formState = useArticleFormState("create");

  // 离开保护
  const { confirmLeave, confirmDialogProps } = useUnsavedChangesGuard(
    formState.dirty,
    formState.saving,
  );

  // 拦截返回箭头 / 取消按钮的链接点击（dirty 时弹出确认弹窗）
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
      {/* 页头 */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/articles"
          onClick={handleNavigation}
          className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-zinc-100">新建文章</h1>
      </div>

      <ArticleForm
        mode="create"
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
        autoSlug={true}
        onSubmit={formState.handleSubmit}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
