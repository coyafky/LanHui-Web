import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { wheelGalleryImages } from "@/lib/wheel-products";

export function WheelHero() {
  const heroImage = wheelGalleryImages[0]!;

  return (
    <section
      className="relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-900"
      aria-labelledby="wheel-title"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(14,165,233,0.18),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_56%,#09090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-24 md:pb-20">
        <nav className="mb-8 flex items-center text-sm text-zinc-500">
          <Link href="/product" className="hover:text-white transition-colors">
            产品中心
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" aria-hidden="true" />
          <span className="text-zinc-300">轮毂升级</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-sky-500/40 bg-sky-500/10 text-sky-200"
              >
                WHEEL UPGRADE · 轮毂升级
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900/80 text-zinc-300"
              >
                {wheelGalleryImages.length} 张轮毂图
              </Badge>
            </div>

            <h1
              id="wheel-title"
              className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
            >
              轮毂升级与外观姿态方案
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
              通过轮毂样式、颜色和辐条视觉改变整车侧面姿态。具体尺寸、ET、孔距、中心孔、载重和胎压传感器方案，需要结合原车数据到店确认。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#wheel-gallery"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-sky-400 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-sky-300"
              >
                查看全部轮毂图
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                到店确认数据
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
                  轮毂视觉参考 · 到店确认适配数据
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
