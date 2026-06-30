"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { LiAutoSeriesUpgradeProject } from "@/lib/li-auto-series-upgrade-projects";

type LiAutoSeriesFeaturedGridProps = {
  projects: readonly LiAutoSeriesUpgradeProject[];
};

const FEATURED_LENGTH = 10;

function assertFeaturedLength(projects: readonly LiAutoSeriesUpgradeProject[]): void {
  if (projects.length !== FEATURED_LENGTH) {
    throw new Error(
      `LiAutoSeriesFeaturedGrid expects ${FEATURED_LENGTH} featured projects, got ${projects.length}`,
    );
  }
}

/**
 * 10 热门推荐卡片网格（Client Component）
 * PRD §7.1：3 列 / md:2 / sm:1，4:3 功能预览图 + 名称 + 摘要
 */
export function LiAutoSeriesFeaturedGrid({ projects }: LiAutoSeriesFeaturedGridProps) {
  assertFeaturedLength(projects);

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            FEATURED PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            热门推荐 · 10 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            覆盖新车保护、家庭后排、上下车便利、座舱舒适、外观升级、露营/户外六大场景
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((p) => (
            <article
              key={p.key}
              id={p.key}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800 overflow-hidden">
                {p.publicPath ? (
                  <Image
                    src={p.publicPath}
                    alt={`${p.name} 升级项目功能预览`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`${p.name} 升级项目功能预览`}
                    className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-900"
                  />
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-700/60 text-amber-400 bg-amber-950/30"
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
                  理想系列 {p.name} 升级项目
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
      </div>
    </section>
  );
}
