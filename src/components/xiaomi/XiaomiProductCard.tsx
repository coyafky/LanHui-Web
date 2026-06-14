"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PhoneCta } from "@/components/cta/PhoneCta";
import {
  xiaomiCategoryLabel,
  type XiaomiProduct,
} from "@/lib/xiaomi-products";

type XiaomiProductCardProps = {
  product: XiaomiProduct;
};

/**
 * 单个产品卡片（Client Component，因为 PhoneCta 需要埋点）
 * PRD §8.3：图片 + 展示名称 + 车型标签 + 主分类标签 + CTA "咨询此款"
 */
export function XiaomiProductCard({ product }: XiaomiProductCardProps) {
  const { image, displayName, vehicleModel, category } = product;
  return (
    <article className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
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
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-orange-700/60 text-orange-400 bg-orange-950/30"
          >
            {vehicleModel}
          </Badge>
          <Badge
            variant="outline"
            className="border-zinc-700 text-zinc-300"
          >
            {xiaomiCategoryLabel[category]}
          </Badge>
        </div>
        <h4 className="text-base font-bold text-white">{displayName}</h4>
        <div className="mt-auto pt-2">
          <PhoneCta
            source="xiaomi_product_consult_click"
            label="咨询此款"
            variant="outline"
            size="sm"
            className="w-full"
            metadata={{
              productId: product.id,
              vehicleModel,
              category,
            }}
          />
        </div>
      </div>
    </article>
  );
}