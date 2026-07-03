import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { wheelCategoryLabels, wheelGalleryImages } from "@/lib/wheel-products";

export function WheelGallery() {
  return (
    <section
      id="wheel-gallery"
      className="bg-zinc-950 py-14 md:py-18 border-y border-zinc-900"
      aria-labelledby="wheel-gallery-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 md:mb-11 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-widest text-sky-400 mb-3">
              WHEEL GALLERY
            </p>
            <h2
              id="wheel-gallery-title"
              className="text-2xl md:text-3xl font-bold text-white"
            >
              现有轮毂视觉图库
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              统一用 3:4 竖图展示，先看风格方向；具体尺寸和数据需到店确认。
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-zinc-700 bg-zinc-900 text-zinc-300"
          >
            共 {wheelGalleryImages.length} 张
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {wheelGalleryImages.map((image) => (
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
                  loading="lazy"
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
                  className="shrink-0 border-sky-700/40 bg-sky-500/10 text-[10px] text-sky-200"
                >
                  {wheelCategoryLabels[image.category]}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-relaxed text-zinc-500">
          * 图库用于展示轮毂视觉方向；具体品牌、尺寸、颜色、轮胎规格和适配边界以到店确认结果为准。
        </p>
      </div>
    </section>
  );
}
