"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import {
  ZEEKR_8X_PROJECT_COUNT,
  ZEEKR_8X_CATEGORY_LABELS,
  type Zeekr8xCategory,
  type Zeekr8xScenario,
  type Zeekr8xUpgradeProject,
} from "@/lib/zeekr-8x-products";

export type Zeekr8xScenarioMatrixProps = {
  readonly scenarios: readonly Zeekr8xScenario[];
  readonly projects: readonly Zeekr8xUpgradeProject[];
  readonly canonicalPath: string;
};

function assertProjectCount(projects: readonly Zeekr8xUpgradeProject[]): void {
  if (projects.length !== ZEEKR_8X_PROJECT_COUNT) {
    throw new Error(
      `Zeekr8xScenarioMatrix expects ${ZEEKR_8X_PROJECT_COUNT} projects, got ${projects.length}`,
    );
  }
}

/**
 * 极氪 8X 5 大用车场景矩阵（CC）
 * grid-cols-1 md:grid-cols-2 lg:grid-cols-3
 * 每个场景卡片列出所属项目标签。
 */
export function Zeekr8xScenarioMatrix({
  scenarios,
  projects,
  canonicalPath,
}: Zeekr8xScenarioMatrixProps) {
  assertProjectCount(projects);

  const projectByKey = useMemo(() => {
    const map = new Map<string, Zeekr8xUpgradeProject>();
    for (const p of projects) {
      map.set(p.id, p);
    }
    return map;
  }, [projects]);

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SCENARIOS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            极氪 8X · {scenarios.length} 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按场景筛选项目，找到适合你的升级组合。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s) => {
            const scenarioProjects = s.projectIds
              .map((pid) => projectByKey.get(pid))
              .filter((p): p is Zeekr8xUpgradeProject => Boolean(p));

            return (
              <article
                key={s.id}
                id={`scenario-${s.id}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col scroll-mt-24"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {s.name}
                </h3>
                <p className="text-xs text-orange-300 mb-4">{s.description}</p>

                <p className="text-xs text-zinc-500 mb-2">
                  {`含 ${scenarioProjects.length} 个项目`}
                </p>
                <ul className="flex flex-wrap items-center gap-1.5 mb-4 flex-1">
                  {scenarioProjects.map((p) => (
                    <li key={p.id}>
                      <Badge
                        variant="outline"
                        className="border-orange-800/60 text-orange-300 bg-orange-950/20"
                      >
                        {p.name}
                      </Badge>
                    </li>
                  ))}
                </ul>

                <a
                  href={`${canonicalPath}#project-${s.projectIds[0]}`}
                  onClick={() => {
                    trackClick("zeekr_8x_scenario_click", {
                      scenarioId: s.id,
                    });
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 transition-colors mt-auto"
                >
                  查看项目详情
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
