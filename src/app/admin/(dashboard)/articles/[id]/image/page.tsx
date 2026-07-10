"use client";

import { use } from "react";
import {
  EntityImagePage,
  type EntityImagePageConfig,
} from "@/components/admin/EntityImagePage";

export default function ArticleImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const config: EntityImagePageConfig = {
    entity: "article",
    entityId: id,
    fetchEndpoint: `/api/articles/${id}`,
    backHref: "/admin/articles",
    crumbLabel: "文章管理",
    title: "文章头图",
    storageHint: "建议尺寸 1200×630，支持 WebP 格式",
    selectData: (json: unknown) => {
      const data = (
        json as {
          data?: { id?: string; title?: string; featuredImage?: string | null };
        }
      ).data;
      return {
        id: data?.id ?? "",
        name: data?.title ?? "未命名文章",
        imagePath: data?.featuredImage ?? null,
      };
    },
  };

  return <EntityImagePage config={config} />;
}
