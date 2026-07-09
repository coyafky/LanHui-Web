"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  XIAOMI_SERIES_CATEGORY_LABELS,
  type XiaomiSeriesUpgradeProject,
} from "@/lib/xiaomi-series-upgrade-projects";

type XiaomiSeriesFeaturedGridProps = {
  projects: readonly XiaomiSeriesUpgradeProject[];
};

const FEATURED_LENGTH = 10;

function assertFeaturedLength(projects: readonly XiaomiSeriesUpgradeProject[]): void {
  if (projects.length !== FEATURED_LENGTH) {
    throw new Error(
      `XiaomiSeriesFeaturedGrid expects ${FEATURED_LENGTH} featured projects, got ${projects.length}`,
    );
  }
}

function getPreviewPath(project: XiaomiSeriesUpgradeProject): string {
  return `/images/products/xiaomi/su7/generated/${project.id}.png`;
}

export function XiaomiSeriesFeaturedGrid({
  projects,
}: XiaomiSeriesFeaturedGridProps) {
  assertFeaturedLength(projects);

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            FEATURED PROJECTS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            热门推荐 · 10 个升级项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            覆盖新车保护、外观个性、运动套件、座舱氛围、舒适娱乐与智能便利等场景。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {projects.map((p) => (
            <article
              key={p.id}
              id={p.id}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-zinc-950 border-b border-zinc-800">
                <Image
                  src={getPreviewPath(p)}
                  alt={`小米系列 ${p.name} 升级项目商品预览效果图`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain p-2"
                />
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-orange-700/60 text-orange-400 bg-orange-950/30"
                  >
                    {p.order.toString().padStart(2, "0")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-zinc-700 text-zinc-300"
                  >
                    {XIAOMI_SERIES_CATEGORY_LABELS[p.category]}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-white">
                  小米系列 {p.name} 升级项目
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
