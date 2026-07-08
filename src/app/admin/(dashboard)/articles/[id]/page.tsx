"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { ArticleForm } from "@/components/admin/ArticleForm";
import type { CategoryOption } from "@/components/admin/ArticleForm";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { validateArticleForm } from "@/lib/validations/article";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";

// Fallback: 当 /api/articles/categories 请求失败时,使用这份静态列表保证下拉仍可使用。
const CATEGORIES_FALLBACK: CategoryOption[] = [
  { value: "新闻", label: "新闻" },
  { value: "行业动态", label: "行业动态" },
  { value: "产品知识", label: "产品知识" },
  { value: "公司公告", label: "公司公告" },
];

interface ArticleData {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Snapshot dirty 检测：文章加载完成后保存初始值快照
  const [snapshot, setSnapshot] = useState<ArticleFormInput | null>(null);

  const dirty = useMemo(() => {
    if (!snapshot) return false;
    return (
      title !== snapshot.title ||
      slug !== (snapshot.slug ?? "") ||
      excerpt !== (snapshot.excerpt ?? "") ||
      content !== snapshot.content ||
      featuredImage !== (snapshot.featuredImage ?? "") ||
      category !== (snapshot.category ?? "") ||
      JSON.stringify(tags) !== JSON.stringify(snapshot.tags) ||
      status !== snapshot.status ||
      isSticky !== snapshot.isSticky
    );
  }, [
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    category,
    tags,
    status,
    isSticky,
    snapshot,
  ]);

  // 拉取分类字典
  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        const res = await fetch("/api/articles/categories");
        const json = (await res.json()) as {
          success: boolean;
          data?: { categories: CategoryOption[] };
        };
        if (cancelled) return;
        if (json.success && json.data) {
          setCategories(json.data.categories);
        } else {
          setCategories(CATEGORIES_FALLBACK);
        }
      } catch {
        if (cancelled) return;
        setCategories(CATEGORIES_FALLBACK);
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // 加载文章数据 + 初始化 snapshot
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
        setTitle(article.title);
        setSlug(article.slug);
        setExcerpt(article.excerpt || "");
        setContent(article.content);
        setCategory(article.category || "");
        setTags(article.tags);
        setStatus(article.status as ArticleStatus);
        setIsSticky(article.isSticky);

        // 加载完成时保存 snapshot（用于 dirty 对比）
        setSnapshot({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || undefined,
          content: article.content,
          featuredImage: undefined,
          category: article.category || undefined,
          tags: article.tags,
          status: article.status as ArticleStatus,
          isSticky: article.isSticky,
        });
      } catch {
        setError("加载失败");
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  // 离开保护
  const { confirmLeave, confirmDialogProps } = useUnsavedChangesGuard(
    dirty,
    saving,
  );

  // 拦截返回箭头链接点击（dirty 时弹出确认弹窗）
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
        const res = await fetch(`/api/articles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
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
          toast.error(json.error || "更新失败");
          return;
        }

        // 保存成功后更新 snapshot（清除 dirty）
        setSnapshot(input);
        toast.success("更新成功");
        router.push("/admin/articles");
      } catch {
        toast.error("网络错误，请重试");
      } finally {
        setSaving(false);
      }
    },
    [
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status,
      isSticky,
      id,
      router,
    ],
  );

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
        onSubmit={handleSubmit}
      />

      <ConfirmDialog {...confirmDialogProps} />
    </div>
  );
}
