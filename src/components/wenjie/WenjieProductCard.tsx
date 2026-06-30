"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { type WenjieProduct } from "@/lib/wenjie-products";

type WenjieProductCardProps = {
  product: WenjieProduct;
};

/**
 * 单个产品卡片（Client Component）
 * PRD §8.3：图片 / 展示名称 / 车型标签 / 分类标签
 */
export function WenjieProductCard({ product }: WenjieProductCardProps) {
  const { image, productName, vehicleModel, category, imageStatus } = product;
  const displayName = `问界 ${vehicleModel} ${productName}`;

  return (
    <article className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
      {imageStatus === "matched" && image.publicPath ? (
        <div className="relative aspect-[4/3] bg-zinc-950">
          <Image
            src={image.publicPath}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-2"
            loading="lazy"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={image.alt}
          className="relative aspect-[4/3] bg-zinc-950 border-b border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-900" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30"
          >
            {vehicleModel}
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-300"
          >
            {category}
          </Badge>
        </div>
        <h4 className="text-base font-bold text-white">{displayName}</h4>
        <p className="text-[11px] text-zinc-500 mt-auto pt-2">
          功能预览 · 按车型确认适配
        </p>
      </div>
    </article>
  );
}
