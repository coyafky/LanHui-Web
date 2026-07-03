import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  carMatCategoryLabels,
  carMatGalleryImages,
} from "@/lib/carmat-products";

export function CarMatGallery() {
  return (
    <section
      id="carmat-gallery"
      className="bg-zinc-950 py-14 md:py-18 border-y border-zinc-900"
      aria-labelledby="carmat-gallery-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 md:mb-11 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-widest text-amber-400 mb-3">
              PRODUCT GALLERY
            </p>
            <h2
              id="carmat-gallery-title"
              className="text-2xl md:text-3xl font-bold text-white"
            >
              现有汽车垫产品图库
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              统一使用 3:4 竖图比例展示，方便快速浏览不同覆盖区域、色感和细节效果。
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-zinc-700 bg-zinc-900 text-zinc-300"
          >
            共 {carMatGalleryImages.length} 张
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {carMatGalleryImages.map((image, index) => (
            <Card
              key={image.id}
              className="bg-zinc-900 border-zinc-800 p-0 text-zinc-100 [content-visibility:auto] [contain-intrinsic-size:0_520px]"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
                <Image
                  src={image.publicPath}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
                  loading={index < 4 ? "eager" : "lazy"}
                />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-zinc-800 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {image.title}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {image.filename}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="shrink-0 border-amber-700/40 bg-amber-500/10 text-[10px] text-amber-200"
                >
                  {carMatCategoryLabels[image.category]}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
          * 图库用于展示汽车垫产品视觉与覆盖思路；具体车型适配、颜色、覆盖区域和施工方式以到店确认结果为准。
        </p>
      </div>
    </section>
  );
}
