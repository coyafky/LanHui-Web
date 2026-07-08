"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { EntityImageUploader } from "@/components/admin/EntityImageUploader";

interface ArticleData {
  id: string;
  title: string;
  featuredImage: string | null;
}

export default function ArticleImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `加载失败 (${res.status})`);
      }
      setArticle({
        id: json.data.id,
        title: json.data.title,
        featuredImage: json.data.featuredImage ?? null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (loading && !article) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <p className="text-lg text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">文章封面图</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-zinc-100">{article.title}</span>
      </div>

      <div className="flex items-center gap-3">
        <ImageIcon className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">文章封面图管理</h1>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <EntityImageUploader
          entity="article"
          entityId={article.id}
          currentPath={article.featuredImage}
          placeholderPath="/images/placeholders/store.webp"
          onUploadSuccess={() => void refetch()}
          onDeleteSuccess={() => void refetch()}
        />
      </section>

      <p className="text-xs text-zinc-500">
        图片将以 webp 格式保存到 <code className="text-zinc-400">public/images/articles/</code>。
        支持 jpg / png / webp，最大 5MB。
      </p>
    </div>
  );
}
