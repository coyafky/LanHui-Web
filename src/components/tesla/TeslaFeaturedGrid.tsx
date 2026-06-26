"use client";

import { ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import {
  TESLA_CATEGORY_LABELS,
  type TeslaProject,
  type TeslaScenario,
} from "@/lib/tesla-products";

type TeslaFeaturedGridProps = {
  projects: readonly TeslaProject[];
  scenarios: readonly TeslaScenario[];
};

const FEATURED_LENGTH = 10;

function assertFeaturedLength(projects: readonly TeslaProject[]): void {
  if (projects.length !== FEATURED_LENGTH) {
    throw new Error(
      `TeslaFeaturedGrid expects ${FEATURED_LENGTH} featured projects, got ${projects.length}`,
    );
  }
}

/**
 * 10 大主推项目卡片（Client Component）
 * PRD §7：5 列 / md:2 / sm:1，4:3 图占位 + 名称 + 摘要 + 分类 badge
 * 点击整卡 → 滚动到所属场景 group + 触发埋点（无 PhoneCta）
 */
export function TeslaFeaturedGrid({ projects, scenarios }: TeslaFeaturedGridProps) {
  assertFeaturedLength(projects);

  // 找每个 project 所属的第一个 scenario
  const scenarioByProject = new Map<string, TeslaScenario>();
  for (const s of scenarios) {
    for (const k of s.projectKeys) {
      if (!scenarioByProject.has(k)) {
        scenarioByProject.set(k, s);
      }
    }
  }

  function handleCardClick(project: TeslaProject) {
    const scenario = scenarioByProject.get(project.key);
    if (scenario) {
      const targetId = `scenario-group-${scenario.key}`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    trackClick("tesla_featured_click", {
      projectKey: project.key,
      category: project.category,
      priority: "featured",
    });
  }

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950"
      aria-labelledby="tesla-featured-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-red-400 mb-3">
            FEATURED PROJECTS
          </p>
          <h2
            id="tesla-featured-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            10 大主推项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            覆盖新车保护、外观焕新、座舱舒适、智能影音、电动便利、储物配件六大场景
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {projects.map((p) => {
            const orderLabel = p.order.toString().padStart(2, "0");
            const categoryLabel = TESLA_CATEGORY_LABELS[p.category];
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => handleCardClick(p)}
                aria-label={`查看 ${p.name} 所属场景`}
                className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-red-700/60 transition-colors overflow-hidden flex flex-col text-left"
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
                      className="border-red-900/60 text-red-400 bg-red-950/40"
                    >
                      {orderLabel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-zinc-700 text-zinc-300"
                    >
                      {categoryLabel}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-red-400 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                    {p.summary}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
