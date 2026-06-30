"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
 * PRD §9.1：每组前 4 项默认展开；按「展开更多」/「收起」切换
 * 列表格式：左 — 序号 + 分类 badge + 名称 | 右 — 卖点/收益
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
            const hiddenCount = groupProjects.length - PREVIEW_COUNT;

            return (
              <div
                key={scenario.key}
                id={`scenario-group-${scenario.key}`}
                className="scroll-mt-24"
              >
                {/* 场景标题行 */}
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
                    共 {groupProjects.length} 个项目
                  </Badge>
                </div>

                {/* 列表 — 左名称 | 右卖点 */}
                <div className="space-y-1.5">
                  {visible.map((p) => {
                    const orderLabel = p.order.toString().padStart(2, "0");
                    const categoryLabel = TESLA_CATEGORY_LABELS[p.category];
                    return (
                      <div
                        key={p.key}
                        id={p.key}
                        className="flex items-center justify-between group bg-zinc-900/50 hover:bg-zinc-900 rounded-xl px-4 py-3 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                      >
                        {/* 左侧：序号 + 分类 + 名称 */}
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge
                            variant="outline"
                            className="border-red-900/60 text-red-400 bg-red-950/40 shrink-0 text-xs h-5"
                          >
                            {orderLabel}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-zinc-700 text-zinc-500 shrink-0 text-[10px] h-5"
                          >
                            {categoryLabel}
                          </Badge>
                          <span className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                            {p.name}
                          </span>
                        </div>

                        {/* 右侧：卖点 / 收益 */}
                        <p className="text-xs text-zinc-400 ml-4 shrink-0 hidden sm:block text-right leading-relaxed max-w-sm">
                          {p.summary}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* 展开 / 收起按钮 */}
                {hiddenCount > 0 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => toggleGroup(scenario.key)}
                      aria-expanded={isExpanded}
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
