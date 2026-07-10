"use client";

/**
 * 共享实体图片管理页（PRD §4.3.2）
 *
 * 统一 articles 和 stores 两处图片页面的重复代码。
 * 通过配置对象适配不同实体的 API 响应差异。
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";
import { EntityImageUploader } from "@/components/admin/EntityImageUploader";

/* ── 类型 ── */

export interface EntityImagePageConfig {
  entity: "article" | "store";
  entityId: string;
  fetchEndpoint: string;
  backHref: string;
  crumbLabel: string;
  title: string;
  storageHint: string;
  selectData: (json: unknown) => {
    id: string;
    name: string;
    imagePath: string | null;
  };
}

interface EntityData {
  id: string;
  name: string;
  imagePath: string | null;
}

/* ── 主组件 ── */

export function EntityImagePage({
  config,
}: {
  config: EntityImagePageConfig;
}) {
  const [entityData, setEntityData] = useState<EntityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(config.fetchEndpoint);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `加载失败 (${res.status})`);
      }
      setEntityData(config.selectData(json));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [config.fetchEndpoint, config.selectData]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  /* ── Loading state ── */

  if (loading && !entityData) {
    return (
      <div
        data-testid="entity-image-page-loading"
        className="flex items-center justify-center py-20"
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  /* ── Error state ── */

  if (error && !entityData) {
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

  /* ── Edge case: no data after load ── */

  if (!entityData) return null;

  /* ── Success state ── */

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
        <Link
          href={config.backHref}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          返回列表
        </Link>
        <span className="text-zinc-600">/</span>
        <span className="text-zinc-300">{config.crumbLabel}</span>
        <span className="text-zinc-600">/</span>
        <span className="font-medium text-zinc-100">{entityData.name}</span>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3">
        <ImageIcon className="h-6 w-6 text-orange-500" />
        <h1 className="text-2xl font-bold text-zinc-100">{config.title}</h1>
      </div>

      {/* Uploader */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <EntityImageUploader
          entity={config.entity}
          entityId={entityData.id}
          currentPath={entityData.imagePath}
          placeholderPath="/images/placeholders/store.webp"
          onUploadSuccess={() => void refetch()}
          onDeleteSuccess={() => void refetch()}
        />
      </section>

      {/* Storage hint */}
      <p className="text-xs text-zinc-500">{config.storageHint}</p>
    </div>
  );
}
