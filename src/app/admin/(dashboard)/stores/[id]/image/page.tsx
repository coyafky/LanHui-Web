"use client";

/**
 * Store 图片管理页（PRD §4.3.2）
 *
 * - 拉取 /api/stores/{id} 拿到 imagePath
 * - 用 EntityImageUploader 上传/替换/删除
 * - 上传/删除后本地 refetch
 */

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import { EntityImageUploader } from "@/components/admin/EntityImageUploader";

interface StoreData {
  id: string;
  name: string;
  imagePath: string | null;
}

export default function StoreImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/stores/${id}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `加载失败 (${res.status})`);
      }
      setStore({
        id: json.data.id,
        name: json.data.name,
        imagePath: json.data.imagePath ?? null,
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

  if (loading && !store) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error && !store) {
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

  if (!store) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ── 面包屑 ── */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <Link
          href="/admin/stores"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">门店主图</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-zinc-100">{store.name}</span>
      </div>

      {/* ── 标题 ── */}
      <div className="flex items-center gap-3">
        <ImageIcon className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">门店主图管理</h1>
      </div>

      {/* ── 上传组件 ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <EntityImageUploader
          entity="store"
          entityId={store.id}
          currentPath={store.imagePath}
          placeholderPath="/images/placeholders/store.webp"
          onUploadSuccess={() => void refetch()}
          onDeleteSuccess={() => void refetch()}
        />
      </section>

      {/* ── 元信息 ── */}
      <p className="text-xs text-zinc-500">
        图片将以 webp 格式保存到 <code className="text-zinc-400">public/images/stores/</code>。
        支持 jpg / png / webp，最大 5MB。
      </p>
    </div>
  );
}
