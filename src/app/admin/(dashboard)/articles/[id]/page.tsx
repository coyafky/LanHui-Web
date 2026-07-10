"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { useCategories } from "@/hooks/use-categories";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useArticleFormState } from "@/hooks/use-article-form-state";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  category: string | null;
  tags: string[];
  status: string;
  isSticky: boolean;
  publishedAt: string | null;
}

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [articleData, setArticleData] = useState<ArticleFormInput | null>(null);
  const { categories } = useCategories();

  const formState = useArticleFormState("edit", {
    initialData: articleData ?? undefined,
    articleId: id,
  });

  // 离开保护
  const { confirmLeave, confirmDialogProps } = useUnsavedChangesGuard(
    formState.dirty,
    formState.saving,
  );

  // 拦截返回箭头链接点击（dirty 时弹出确认弹窗）
  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (formState.dirty) {
        e.preventDefault();
        confirmLeave(() => router.push("/admin/articles"));
      }
    },
    [formState.dirty, confirmLeave, router],
  );

  // 加载文章数据
  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const json = await res.json();
        if (!json.success) {
          setError("文章不存在");
          return;
        }
        const article: ArticleData = json.data;
        const parsed: ArticleFormInput = {
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || undefined,
          content: article.content,
          featuredImage: article.featuredImage || undefined,
          category: article.category || undefined,
          tags: article.tags,
          status: article.status as ArticleStatus,
          isSticky: article.isSticky,
        };
        setArticleData(parsed);
      } catch {
        setError("加载失败");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="text-zinc-500">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-100">编辑文章</h1>
        </div>
        <div className="rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

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
