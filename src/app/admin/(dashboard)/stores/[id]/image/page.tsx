"use client";

import { use } from "react";
import {
  EntityImagePage,
  type EntityImagePageConfig,
} from "@/components/admin/EntityImagePage";

export default function StoreImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const config: EntityImagePageConfig = {
    entity: "store",
    entityId: id,
    fetchEndpoint: `/api/stores/${id}`,
    backHref: "/admin/stores",
    crumbLabel: "门店管理",
    title: "门店图片",
    storageHint: "建议尺寸 800×600，支持 WebP 格式",
    selectData: (json: unknown) => {
      const data = (
        json as {
          data?: { id?: string; name?: string; imagePath?: string | null };
        }
      ).data;
      return {
        id: data?.id ?? "",
        name: data?.name ?? "未命名门店",
        imagePath: data?.imagePath ?? null,
      };
    },
  };

  return <EntityImagePage config={config} />;
}
