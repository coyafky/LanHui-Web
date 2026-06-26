"use client";

import { ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PhoneCta } from "@/components/cta/PhoneCta";
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
 * 10 热门推荐卡片网格（Client Component）
 * PRD §7.1：3 列 / md:2 / sm:1，4:3 图占位 + 名称 + 摘要 + 适用车型 + PhoneCta
 */
export function WenjieSeriesFeaturedGrid({ projects }: WenjieSeriesFeaturedGridProps) {
  assertFeaturedLength(projects);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((p) => (
            <article
              key={p.key}
              id={p.key}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div
                role="img"
                aria-label={`${p.name} 升级项目预览图`}
                className="relative aspect-[4/3] bg-zinc-950 border-b border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-500"
              >
                <ImageIcon className="w-8 h-8 mb-2" aria-hidden />
                <p className="text-xs">图片待补充</p>
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
                <div className="mt-auto pt-2">
                  <PhoneCta
                    source="wenjie_series_featured_consult"
                    label="咨询此款"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    metadata={{
                      projectKey: p.key,
                      category: p.category,
                      priority: "featured",
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}