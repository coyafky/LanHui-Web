import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  electricStepImages,
  electricStepVariantLabels,
} from "@/lib/electric-step-products";

export function ElectricStepGallery() {
  return (
    <section
      id="electric-step-gallery"
      className="bg-black py-14 md:py-18 border-y border-zinc-900"
      aria-labelledby="electric-step-gallery-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-col gap-4 md:mb-11 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-widest text-orange-400 mb-3">
              STEP GALLERY
            </p>
            <h2
              id="electric-step-gallery-title"
              className="text-2xl md:text-3xl font-bold text-white"
            >
              电动踏板款式图库
            </h2>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-zinc-400 leading-relaxed">
              目前展示无灯款、单流光灯款和大灯带款三种视觉参考。具体款式以车型结构和到店沟通为准。
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-zinc-700 bg-zinc-900 text-zinc-300"
          >
            共 {electricStepImages.length} 款
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {electricStepImages.map((image) => (
            <Card
              key={image.id}
              className="bg-zinc-900 border-zinc-800 p-0 text-zinc-100 [content-visibility:auto] [contain-intrinsic-size:0_420px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
                <Image
                  src={image.publicPath}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-contain p-3 transition-transform duration-300 group-hover/card:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="border-t border-zinc-800 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">
                    {image.title}
                  </p>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-orange-700/40 bg-orange-500/10 text-[10px] text-orange-200"
                  >
                    {electricStepVariantLabels[image.variant]}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {image.note}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
