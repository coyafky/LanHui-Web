import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { carMatGalleryImages } from "@/lib/carmat-products";

export function CarMatHero() {
  const heroImage = carMatGalleryImages[0]!;

  return (
    <section
      className="relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-900"
      aria-labelledby="carmat-title"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.16),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_56%,#09090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-24 md:pb-20">
        <nav className="mb-8 flex items-center text-sm text-zinc-500">
          <Link href="/product" className="hover:text-white transition-colors">
            产品中心
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" aria-hidden="true" />
          <span className="text-zinc-300">汽车垫</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-amber-200"
              >
                CARMAT · 汽车垫
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900/80 text-zinc-300"
              >
                {carMatGalleryImages.length} 张产品图
              </Badge>
            </div>

            <h1
              id="carmat-title"
              className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
            >
              汽车垫与 360 软包脚垫方案
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
              围绕新能源车主常见的脚部磨损、泥沙清洁、尾箱收纳和后排接待场景，提供多款汽车垫视觉方案参考。具体车型、年款和座椅布局以到店沟通为准。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#carmat-gallery"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-500 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-amber-400"
              >
                查看全部汽车垫
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                到店沟通车型
              </Link>
            </div>
          </div>

          <Card className="bg-zinc-900/70 border-zinc-800 p-0 shadow-2xl shadow-black/40">
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-950">
              <Image
                src={heroImage.publicPath}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1024px) 420px, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                <p className="text-sm font-semibold text-white">
                  {heroImage.title}
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  1086×1448 竖图素材 · 稳定 3:4 展示
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
