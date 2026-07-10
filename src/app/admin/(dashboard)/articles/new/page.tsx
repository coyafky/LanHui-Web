"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ArticleForm } from "@/components/admin/ArticleForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { validateArticleForm } from "@/lib/validations/article";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { useCategories } from "@/hooks/use-categories";

export default function NewArticlePage() {
  const router = useRouter();
  const { categories } = useCategories();

  // 表单字段
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [isSticky, setIsSticky] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ArticleFormInput, string>>
  >({});
  const [saving, setSaving] = useState(false);

  // dirty 判定：新建页初始全为空，任何字段非空即 dirty
  const dirty = useMemo(() => {
    return (
      title.trim() !== "" ||
      slug.trim() !== "" ||
      excerpt.trim() !== "" ||
      content.trim() !== "" ||
      featuredImage.trim() !== "" ||
      category !== "" ||
      tags.length > 0 ||
      status !== "draft" ||
      isSticky
    );
  }, [title, slug, excerpt, content, featuredImage, category, tags, status, isSticky]);

  // 离开保护
  const { confirmLeave, confirmDialogProps } = useUnsavedChangesGuard(dirty, saving);

  // 拦截返回箭头 / 取消按钮的链接点击（dirty 时弹出确认弹窗）
  const handleNavigation = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (dirty) {
        e.preventDefault();
        confirmLeave(() => router.push("/admin/articles"));
      }
    },
    [dirty, confirmLeave, router],
  );

  // 提交
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // 构建校验输入
      const input: ArticleFormInput = {
        title,
        slug: slug || undefined,
        excerpt: excerpt || undefined,
        content,
        featuredImage: featuredImage || undefined,
        category: category || undefined,
        tags,
        status,
        isSticky,
      };

      // 客户端校验
      const { valid, fieldErrors: errors } = validateArticleForm(input);
      setFieldErrors(errors);
      if (!valid) return;

      setSaving(true);

      try {
        const res = await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug: slug || undefined,
            excerpt: excerpt || undefined,
            content,
            category: category || null,
            tags,
            status,
            isSticky,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          // 服务端字段错误映射到表单
          if (json.details?.fieldErrors) {
            setFieldErrors(json.details.fieldErrors);
          }
          toast.error(json.error || "创建失败");
          return;
        }

        toast.success("创建成功");
        router.push("/admin/articles");
      } catch {
        toast.error("网络错误，请重试");
      } finally {
        setSaving(false);
      }
    },
    [title, slug, excerpt, content, featuredImage, category, tags, status, isSticky, router],
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
        title={title}
        onTitleChange={setTitle}
        slug={slug}
        onSlugChange={(v) => {
          setSlug(v);
          setSlugManuallyEdited(true);
        }}
        excerpt={excerpt}
        onExcerptChange={setExcerpt}
        content={content}
        onContentChange={setContent}
        featuredImage={featuredImage}
        onFeaturedImageChange={setFeaturedImage}
        category={category}
        onCategoryChange={setCategory}
        tags={tags}
        onTagsChange={setTags}
        status={status}
        onStatusChange={setStatus}
        isSticky={isSticky}
        onIsStickyChange={setIsSticky}
        fieldErrors={fieldErrors}
        saving={saving}
        categories={categories}
        slugManuallyEdited={slugManuallyEdited}
        autoSlug={true}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
