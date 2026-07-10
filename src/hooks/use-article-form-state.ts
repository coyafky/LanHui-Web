"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { validateArticleForm } from "@/lib/validations/article";
import type { ArticleFormInput, ArticleStatus } from "@/lib/validations/article";

export function useArticleFormState(
  mode: "create" | "edit",
  options?: {
    initialData?: ArticleFormInput;
    articleId?: string;
  },
) {
  const router = useRouter();
  const init = options?.initialData;

  // ---------- Field states ----------
  const [title, setTitle] = useState(init?.title ?? "");
  const [slug, setSlug] = useState(init?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [excerpt, setExcerpt] = useState(init?.excerpt ?? "");
  const [content, setContent] = useState(init?.content ?? "");
  const [featuredImage, setFeaturedImage] = useState(
    init?.featuredImage ?? "",
  );
  const [category, setCategory] = useState(init?.category ?? "");
  const [tags, setTags] = useState<string[]>(init?.tags ?? []);
  const [status, setStatus] = useState<ArticleStatus>(
    init?.status ?? "draft",
  );
  const [isSticky, setIsSticky] = useState(init?.isSticky ?? false);

  // ---------- Meta states ----------
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ArticleFormInput, string>>
  >({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ---------- Snapshot for dirty detection (edit mode) ----------
  const [snapshot, setSnapshot] = useState<ArticleFormInput | null>(
    mode === "edit" && init ? init : null,
  );

  // Sync when initialData changes (handles async loading in edit mode)
  // We serialize to JSON to detect deep changes without reference equality issues
  const prevInitialDataStr = useRef<string | null>(null);
  const initialDataStr = JSON.stringify(options?.initialData ?? null);

  useEffect(() => {
    if (mode !== "edit") return;
    if (!options?.initialData) return;
    // Skip re-sync if the data hasn't actually changed
    if (initialDataStr === prevInitialDataStr.current) return;
    prevInitialDataStr.current = initialDataStr;

    const data = options.initialData;
    setTitle(data.title ?? "");
    setSlug(data.slug ?? "");
    setSlugManuallyEdited(false);
    setExcerpt(data.excerpt ?? "");
    setContent(data.content ?? "");
    setFeaturedImage(data.featuredImage ?? "");
    setCategory(data.category ?? "");
    setTags(data.tags ?? []);
    setStatus(data.status ?? "draft");
    setIsSticky(data.isSticky ?? false);
    setSnapshot(data);
    setFieldErrors({});
    setServerError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDataStr, mode]);

  // ---------- Dirty detection ----------
  const dirty = useMemo(() => {
    if (mode === "create") {
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
    }

    // Edit mode: compare with snapshot
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
    mode,
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

  // ---------- Auto-slug (create mode only) ----------
  useEffect(() => {
    if (mode !== "create") return;
    if (slugManuallyEdited) return;
    if (!title.trim()) return;

    setSlug(Date.now().toString(36));
  }, [title, mode, slugManuallyEdited]);

  // ---------- Field change handlers ----------
  const onTitleChange = useCallback((v: string) => {
    setTitle(v);
  }, []);

  const onSlugChange = useCallback((v: string) => {
    setSlug(v);
    setSlugManuallyEdited(true);
  }, []);

  const onExcerptChange = useCallback((v: string) => {
    setExcerpt(v);
  }, []);

  const onContentChange = useCallback((v: string) => {
    setContent(v);
  }, []);

  const onFeaturedImageChange = useCallback((v: string) => {
    setFeaturedImage(v);
  }, []);

  const onCategoryChange = useCallback((v: string) => {
    setCategory(v);
  }, []);

  const onTagsChange = useCallback((v: string[]) => {
    setTags(v);
  }, []);

  const onStatusChange = useCallback((v: ArticleStatus) => {
    setStatus(v);
  }, []);

  const onIsStickyChange = useCallback((v: boolean) => {
    setIsSticky(v);
  }, []);

  // ---------- Submit handler ----------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setServerError(null);

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

      // Client-side validation
      const { valid, fieldErrors: errors } = validateArticleForm(input);
      setFieldErrors(errors);
      if (!valid) return;

      setSaving(true);

      try {
        const url =
          mode === "create"
            ? "/api/articles"
            : `/api/articles/${options?.articleId}`;
        const method = mode === "create" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug: slug || undefined,
            excerpt: excerpt || undefined,
            content,
            featuredImage: featuredImage || null,
            category: category || null,
            tags,
            status,
            isSticky,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          // Map server field errors to form
          if (json.details?.fieldErrors) {
            setFieldErrors(json.details.fieldErrors);
          }
          const errMsg =
            json.error || (mode === "create" ? "创建失败" : "更新失败");
          setServerError(errMsg);
          toast.error(errMsg);
          return;
        }

        // Update snapshot after successful save (edit mode)
        if (mode === "edit") {
          setSnapshot(input);
        }

        toast.success(mode === "create" ? "创建成功" : "更新成功");
        router.push("/admin/articles");
      } catch {
        const errMsg = "网络错误，请重试";
        setServerError(errMsg);
        toast.error(errMsg);
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
      mode,
      options?.articleId,
      router,
    ],
  );

  return {
    title,
    onTitleChange,
    slug,
    onSlugChange,
    slugManuallyEdited,
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
    dirty,
    serverError,
    handleSubmit,
  };
}
