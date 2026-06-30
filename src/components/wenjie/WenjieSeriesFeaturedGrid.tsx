"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { WenjieSeriesUpgradeProject } from "@/lib/wenjie-series-upgrade-projects";

type WenjieSeriesFeaturedGridProps = {
  projects: readonly WenjieSeriesUpgradeProject[];
};

const FEATURED_LENGTH = 10;

function assertFeaturedLength(projects: readonly WenjieSeriesUpgradeProject[]): void {
  if (projects.length !== FEATURED_LENGTH) {
    throw new Error(
      `WenjieSeriesFeaturedGrid expects ${FEATURED_LENGTH} featured projects, got ${projects.length}`,
    );
  }
}

/**
 * 10 热门推荐：有图片的卡片网格 + 无图片的列表（左名称/右卖点）
 * PRD §7.1：3 列 / md:2 / sm:1，4:3 功能预览图
 */
export function WenjieSeriesFeaturedGrid({ projects }: WenjieSeriesFeaturedGridProps) {
  assertFeaturedLength(projects);

  const withImage = projects.filter((p) => p.image.publicPath !== null);
  const withoutImage = projects.filter((p) => p.image.publicPath === null);

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            FEATURED PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            热门推荐 · 10 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            覆盖新车保护、家庭后排、上下车便利、座舱舒适、智能影音、外观升级、露营/户外七大场景
          </p>
        </div>

        {/* 有图片的卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {withImage.map((p) => (
            <article
              key={p.key}
              id={p.key}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800">
                <Image
                  src={p.image.publicPath!}
                  alt={p.image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30"
                  >
                    {p.order.toString().padStart(2, "0")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-zinc-300"
                  >
                    {p.category}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white">
                  问界系列 {p.name} 升级项目
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {p.summary}
                </p>
                <p className="text-[11px] text-zinc-500 mt-auto pt-2">
                  功能预览 · 到店按车型确认适配
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* 无图片的列表：左名称 / 右卖点 */}
        {withoutImage.length > 0 && (
          <div className="mt-6 border-t border-zinc-800 pt-6">
            <p className="text-sm text-cyan-400 mb-4 tracking-wider">
              更多热门项目 · 到店咨询
            </p>
            <div className="space-y-2">
              {withoutImage.map((p) => (
                <div
                  key={p.key}
                  id={p.key}
                  className="flex items-center justify-between group bg-zinc-900/50 hover:bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge
                      variant="outline"
                      className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30 shrink-0"
                    >
                      {p.order.toString().padStart(2, "0")}
                    </Badge>
                    <span className="text-sm font-bold text-white truncate">
                      问界系列 {p.name}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 ml-4 shrink-0 hidden sm:block text-right leading-relaxed max-w-xs">
                    {p.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
