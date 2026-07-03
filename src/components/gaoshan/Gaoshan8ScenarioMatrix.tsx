"use client";

import { useCallback } from "react";
import { trackClick } from "@/lib/analytics";
import type {
  Gaoshan8Scenario,
  Gaoshan8UpgradeProject,
} from "@/lib/gaoshan-products";

type Gaoshan8ScenarioMatrixProps = {
  scenarios: readonly Gaoshan8Scenario[];
  allProjects: readonly Gaoshan8UpgradeProject[];
};

const SCENARIO_LENGTH = 7;

function assertScenarioLength(scenarios: readonly Gaoshan8Scenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `Gaoshan8ScenarioMatrix expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

/**
 * 7 大用车场景矩阵（Client Component）
 * 点击场景卡片后由 Gaoshan8ProjectGrid 监听 hash 并完成筛选。
 */
export function Gaoshan8ScenarioMatrix({
  scenarios,
  allProjects,
}: Gaoshan8ScenarioMatrixProps) {
  assertScenarioLength(scenarios);
  const projectNameById = new Map(allProjects.map((p) => [p.id, p.name]));

  const handleScenarioClick = useCallback((scenario: Gaoshan8Scenario) => {
    trackClick("gaoshan_8_scenario_click", {
      scenarioKey: scenario.key,
      scenarioName: scenario.name,
      projectCount: scenario.projectIds.length,
    });
  }, []);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="gaoshan-8-scenarios-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-teal-400 mb-3">
            SCENARIOS
          </p>
          <h2
            id="gaoshan-8-scenarios-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            高山 8 · {scenarios.length} 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景选择升级方向；点击场景卡片查看对应项目。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((s) => (
            <a
              key={s.key}
              href={`#${s.key}`}
              onClick={() => handleScenarioClick(s)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-teal-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-1.5">
                {s.name}
              </h3>
              <p className="text-xs text-teal-300 mb-3">{s.description}</p>

              <p className="text-xs text-zinc-500 mb-2">
                含 {s.projectIds.length} 个项目
              </p>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {s.projectIds.map((pid) => {
                  const name = projectNameById.get(pid) ?? pid;
                  return (
                    <span
                      key={pid}
                      className="text-xs px-2 py-1 rounded-md border border-teal-900/60 text-teal-400 bg-teal-950/30"
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
