"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FlooringVehicleGroup as Group } from "@/lib/flooring-products";

type FlooringVehicleGroupProps = {
  group: Group;
};

export function FlooringVehicleGroup({ group }: FlooringVehicleGroupProps) {
  const hasCarousel = group.colorVariants.length > 1;
  const heroVariant = group.colorVariants[0];

  return (
    <article
      id={group.id}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
    >
      {/* 头部：品牌名 + 模型 + 核心标签 */}
      <header className="p-6 md:p-8 border-b border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            {group.brandName}
          </h3>
          <Badge
            variant="outline"
            className="border-amber-700/60 text-amber-400 bg-amber-950/30"
          >
            热门车型
          </Badge>
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          覆盖车型：
          {group.models.map((m, idx) => (
            <span key={m}>
              <span className="text-zinc-300">{m}</span>
              {idx < group.models.length - 1 && " / "}
            </span>
          ))}
        </p>
        <h4 className="text-lg md:text-xl font-semibold text-amber-400 mb-2">
          {group.headline}
        </h4>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-3xl">
          {group.summary}
        </p>
      </header>

      {/* 主图 + 颜色轮播 */}
      <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3">
          {hasCarousel ? (
            <Carousel
              opts={{ loop: true, align: "start" }}
              className="w-full"
            >
              <CarouselContent>
                {group.colorVariants.map((variant) => (
                  <CarouselItem key={variant.id}>
                    <Card className="bg-zinc-950 border-zinc-800 overflow-hidden p-0">
                      <div className="relative aspect-[4/3] bg-zinc-950">
                        <Image
                          src={variant.assetPath}
                          alt={variant.alt}
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-white">
                            {group.brandName} · {variant.colorName}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {variant.description}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-zinc-700 text-zinc-300"
                        >
                          {variant.colorName}
                        </Badge>
                      </div>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-3 bg-black/70 border-zinc-700 hover:bg-black" />
              <CarouselNext className="right-3 bg-black/70 border-zinc-700 hover:bg-black" />
            </Carousel>
          ) : (
            heroVariant && (
              <Card className="bg-zinc-950 border-zinc-800 overflow-hidden p-0">
                <div className="relative aspect-[4/3] bg-zinc-950">
                  <Image
                    src={heroVariant.assetPath}
                    alt={heroVariant.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 border-t border-zinc-800">
                  <p className="text-sm font-bold text-white">
                    {group.brandName} · {heroVariant.colorName}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {heroVariant.description}
                  </p>
                </div>
              </Card>
            )
          )}
        </div>

        {/* 卖点 + 说明 + 适配声明 */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <p className="text-xs tracking-widest text-amber-400 mb-2">
              PRODUCT INTRO
            </p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {group.productIntro}
            </p>
          </div>

          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4">
            <p className="text-xs tracking-widest text-amber-400 mb-3">
              SELLING POINTS
            </p>
            <ul className="space-y-2">
              {group.sellingPointIds.slice(0, 4).map((id) => (
                <li
                  key={id}
                  className="text-sm text-zinc-300 flex items-start gap-2"
                >
                  <span
                    className={cn(
                      "mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0",
                    )}
                  />
                  <span>{sellingPointLabel(id)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-950/20 rounded-xl border border-amber-800/40 p-4">
            <p className="text-xs font-semibold text-amber-400 mb-1">
              适配提示
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {group.fitmentNote}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

// 简化版卖点文案（避免在客户端组件中再依赖服务端数据）
function sellingPointLabel(id: string): string {
  const map: Record<string, string> = {
    "model-fitment": "按车型适配展示",
    "color-match": "颜色可对比",
    "floor-rail-integration": "地板与滑轨整合",
    "door-step-comfort": "上下车与脚部体验",
    "trunk-continuity": "尾箱区域联动",
    "easy-care": "便于日常维护",
    "premium-cabin": "提升座舱质感",
  };
  return map[id] ?? id;
}