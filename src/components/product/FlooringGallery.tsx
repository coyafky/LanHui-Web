import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { flooringGalleryItems, flooringVehicleGroups } from "@/lib/flooring-products";

export function FlooringGallery() {
  return (
    <section className="py-16 md:py-20 bg-zinc-950 border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            GALLERY
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            热门车型地板总成图库
          </h2>
          <p className="text-zinc-400 mt-3 max-w-2xl mx-auto">
            按品牌分组展示雪霜白、中性灰、岩石黑、木纹咖四种视觉效果，仅展示画册可见的产品视觉。
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {flooringGalleryItems.map((item) => {
            const group = flooringVehicleGroups.find((g) =>
              g.colorVariants.some((cv) => cv.id === item.id),
            );
            return (
              <Card
                key={item.id}
                className="bg-zinc-900 border-zinc-800 overflow-hidden p-0"
              >
                <div className="relative aspect-[4/3] bg-zinc-950">
                  <Image
                    src={item.assetPath}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-3 border-t border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {group?.brandName ?? ""} · {item.colorName}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-zinc-400 text-[10px] py-0 px-1.5"
                  >
                    {item.colorName}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-zinc-500 text-center mt-8">
          * 图库仅展示画册可见产品视觉；具体适配需到店沟通车型、年份与座椅布局。
        </p>
      </div>
    </section>
  );
}