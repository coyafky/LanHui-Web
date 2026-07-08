import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { electricStepImages } from "@/lib/electric-step-products";

export function ElectricStepHero({ breadcrumbItems }: { breadcrumbItems?: readonly BreadcrumbItem[] }) {
  const heroImage = electricStepImages[0]!;

  return (
    <section
      className="relative overflow-hidden bg-zinc-950 text-white border-b border-zinc-900"
      aria-labelledby="electric-step-title"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(249,115,22,0.18),transparent_34%),linear-gradient(135deg,#09090b_0%,#18181b_56%,#09090b_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-14 md:pt-24 md:pb-20">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-orange-500/40 bg-orange-500/10 text-orange-200"
              >
                ELECTRIC STEPS · 电动踏板
              </Badge>
              <Badge
                variant="outline"
                className="border-zinc-700 bg-zinc-900/80 text-zinc-300"
              >
                3 款灯带方案
              </Badge>
            </div>

            <h1
              id="electric-step-title"
              className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl"
            >
              电动踏板与迎宾灯带方案
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-lg">
              面向 SUV、MPV、大六座和高底盘车型，围绕老人小孩上下车、商务接待和原车姿态保留提供电动踏板方案参考。具体安装位、电气接口和离地间隙需到店确认。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#electric-step-fitment"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-orange-500 px-4 text-sm font-semibold text-zinc-950 transition-colors hover:bg-orange-400"
              >
                查看适配车型词云
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-900"
              >
                到店确认车型
              </Link>
            </div>
          </div>

          <Card className="bg-zinc-900/70 border-zinc-800 p-0 shadow-2xl shadow-black/40">
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-950">
              <Image
                src={heroImage.publicPath}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1024px) 520px, 100vw"
                className="object-contain p-3"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
                <p className="text-sm font-semibold text-white">
                  {heroImage.title}
                </p>
                <p className="mt-1 text-xs text-zinc-300">
                  图片完整展示 · 不裁切踏板主体
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
