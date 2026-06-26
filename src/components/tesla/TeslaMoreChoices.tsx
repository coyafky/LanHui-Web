"use client";

import { useState } from "react";
import { ChevronDown, ImageIcon } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import {
  TESLA_CATEGORY_LABELS,
  type TeslaProject,
  type TeslaScenario,
} from "@/lib/tesla-products";

type TeslaMoreChoicesProps = {
  projects: readonly TeslaProject[];
  scenarios: readonly TeslaScenario[];
};

const OPTIONAL_LENGTH = 32;
const PREVIEW_COUNT = 4;

function assertOptionalLength(projects: readonly TeslaProject[]): void {
  if (projects.length !== OPTIONAL_LENGTH) {
    throw new Error(
      `TeslaMoreChoices expects ${OPTIONAL_LENGTH} optional projects, got ${projects.length}`,
    );
  }
}

/**
 * 32 个可选项目按 6 个场景分组折叠（Client Component）
 * PRD §9.1：每组前 4 项默认展开；点击「展开更多」/「收起」切换
 * 每张项目卡：序号 + 分类 badge + 名称 + 摘要 + 4:3 图占位
 * 点击项目卡 → 触发埋点
 */
export function TeslaMoreChoices({ projects, scenarios }: TeslaMoreChoicesProps) {
  assertOptionalLength(projects);

  const projectByKey = new Map<string, TeslaProject>(
    projects.map((p) => [p.key, p] as const),
  );

  const [expandedGroups, setExpandedGroups] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  function toggleGroup(key: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function handleProjectClick(project: TeslaProject, scenarioKey: string) {
    trackClick("tesla_optional_click", {
      projectKey: project.key,
      category: project.category,
      priority: "optional",
      scenarioKey,
    });
  }

  return (
    <section
      className="py-16 md:py-20 bg-black border-y border-zinc-900"
      aria-labelledby="tesla-more-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-red-400 mb-3">
            MORE CHOICES
          </p>
          <h2
            id="tesla-more-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            32 个可选项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            按 6 大用车场景分组，每组默认展示前 4 项；可按需展开查看完整列表
          </p>
        </div>

        <div className="space-y-10">
          {scenarios.map((scenario) => {
            const groupProjects = scenario.projectKeys
              .map((k) => projectByKey.get(k))
              .filter((p): p is TeslaProject => Boolean(p));

            const isExpanded = expandedGroups.has(scenario.key);
            const visible = isExpanded
              ? groupProjects
              : groupProjects.slice(0, PREVIEW_COUNT);
            const hiddenCount = groupProjects.length - visible.length;

            return (
              <div
                key={scenario.key}
                id={`scenario-group-${scenario.key}`}
                className="scroll-mt-24"
              >
                <div className="mb-4 flex flex-wrap items-baseline gap-3">
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {scenario.name}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    {scenario.description}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-red-900/60 text-red-400 bg-red-950/40 ml-auto"
                  >
                    {`共 ${groupProjects.length} 个项目`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                  {visible.map((p) => {
                    const orderLabel = p.order.toString().padStart(2, "0");
                    const categoryLabel = TESLA_CATEGORY_LABELS[p.category];
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => handleProjectClick(p, scenario.key)}
                        aria-label={`查看 ${p.name}`}
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
                        <div className="p-4 flex flex-col gap-2 flex-1">
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
                          <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                            {p.name}
                          </h4>
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                            {p.summary}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {hiddenCount > 0 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleGroup(scenario.key)}
                      aria-expanded={isExpanded}
                      aria-controls={`scenario-group-${scenario.key}-more`}
                      className="inline-flex items-center gap-2 text-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-full border border-zinc-800 hover:border-red-700/60 transition-colors"
                    >
                      {isExpanded
                        ? "收起"
                        : `展开更多（+${hiddenCount}）`}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}