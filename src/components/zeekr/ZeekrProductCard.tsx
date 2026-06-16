"use client";

import Image from "next/image";
import { ImageIcon, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { cn } from "@/lib/utils";
import { type ZeekrProduct } from "@/lib/zeekr-products";

type ZeekrProductCardProps = {
  product: ZeekrProduct;
};

/**
 * 单个产品卡片（Client Component）
 * PRD §8.4 / §8.3：图片 / 展示名称 / 车型标签 / 分类标签 / CTA "咨询此款"
 *
 * 3 态 UI 降级（PRD §8.3 缺图降级容器）：
 *   - matched: 正常 Next/Image + object-contain
 *   - pending-review: 显示图(若 imageStatus 是 matched) + 顶部"待复核"角标
 *   - missing: 虚线降级容器 + ImageIcon + "图片待补充"
 *
 * 容器规格: aspect-[4/3] + object-contain,所有 Next/Image 必带 sizes 属性
 */
export function ZeekrProductCard({ product }: ZeekrProductCardProps) {
  const { image, name, model, category, imageStatus } = product;
  const displayName = `极氪 ${model} ${name}`;

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
      ) : imageStatus === "pending-review" && image.publicPath ? (
        <div className="relative aspect-[4/3] bg-zinc-950">
          <Image
            src={image.publicPath}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-contain p-2 opacity-90"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[10px]">
            <AlertCircle className="w-3 h-3" aria-hidden />
            待复核
          </div>
        </div>
      ) : (
        <div
          role="img"
          aria-label={image.alt}
          className="relative aspect-[4/3] bg-zinc-950 border-b border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
        >
          <ImageIcon className="w-8 h-8 mb-2" aria-hidden />
          <p className="text-xs">图片待补充</p>
          <p className="text-[10px] text-zinc-600 mt-1">
            源 Excel 无对应产品图
          </p>
        </div>
      )}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-orange-700/60 text-orange-400 bg-orange-950/30",
            )}
          >
            {model}
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
            {category}
          </Badge>
        </div>
        <h4 className="text-base font-bold text-white">{displayName}</h4>
        <div className="mt-auto pt-2">
          <PhoneCta
            source="zeekr_product_consult_click"
            label="咨询此款"
            variant="outline"
            size="sm"
            className="w-full"
            metadata={{
              productId: product.id,
              vehicleModel: model,
              category,
              imageStatus,
            }}
          />
        </div>
      </div>
    </article>
  );
}
