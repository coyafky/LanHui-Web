"use client";

import { useCallback } from "react";
import { trackClick } from "@/lib/analytics";
import type {
  Zeekr9xScenario,
  Zeekr9xUpgradeProject,
} from "@/lib/zeekr-9x-products";

export type Zeekr9xScenarioMatrixProps = {
  scenarios: readonly Zeekr9xScenario[];
  allProjects: readonly Zeekr9xUpgradeProject[];
};

/**
 * 极氪 9X 5 大用车场景矩阵（Client）
 * Plan §C.2b：
 *   - 5 场景卡片（grid-cols-1 sm:2 lg:3）
 *   - 每张卡片：场景名、项目数、项目名标签
 *   - 点击 → hash 切换 + 埋点 zeekr_9x_scenario_click
 *   - Zeekr9xProjectGrid 监听 hashchange 完成场景筛选
 */
export function Zeekr9xScenarioMatrix({
  scenarios,
  allProjects,
}: Zeekr9xScenarioMatrixProps) {
  const projectNameById = new Map(allProjects.map((p) => [p.id, p.name]));

  const handleScenarioClick = useCallback(
    (scenario: Zeekr9xScenario) => {
      trackClick("zeekr_9x_scenario_click", {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
      });
    },
    [],
  );

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SCENARIOS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            极氪 9X · {scenarios.length} 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景选择升级方向；点击场景卡片查看对应项目。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s) => (
            <a
              key={s.id}
              href={`#scenario-${s.id}`}
              onClick={() => handleScenarioClick(s)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-orange-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-1.5">
                {s.name}
              </h3>
              <p className="text-xs text-orange-300 mb-3">{s.description}</p>

              <p className="text-xs text-zinc-500 mb-2">
                含 {s.projectIds.length} 个项目
              </p>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {s.projectIds.map((pid) => {
                  const name = projectNameById.get(pid) ?? pid;
                  return (
                    <span
                      key={pid}
                      className="text-xs px-2 py-1 rounded-md border border-orange-900/60 text-orange-400 bg-orange-950/30"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
