"use client";

import { useCallback } from "react";
import { trackClick } from "@/lib/analytics";
import type {
  LiAutoI6Scenario,
  LiAutoI6UpgradeProject,
} from "@/lib/li-auto-i6-products";

type LiAutoI6ScenarioMatrixProps = {
  scenarios: readonly LiAutoI6Scenario[];
  allProjects: readonly LiAutoI6UpgradeProject[];
};

const SCENARIO_LENGTH = 5;

function assertScenarioLength(scenarios: readonly LiAutoI6Scenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `LiAutoI6ScenarioMatrix expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

export function LiAutoI6ScenarioMatrix({
  scenarios,
  allProjects,
}: LiAutoI6ScenarioMatrixProps) {
  assertScenarioLength(scenarios);

  const projectNameByKey = new Map<string, string>(
    allProjects.map((p) => [p.key, p.name] as const),
  );

  const handleScenarioClick = useCallback((scenario: LiAutoI6Scenario) => {
    trackClick("li_auto_i6_scenario_click", {
      scenarioId: scenario.key,
      scenarioName: scenario.name,
      projectCount: scenario.projectKeys.length,
    });
  }, []);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="li-auto-i6-scenarios-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SCENARIOS
          </p>
          <h2
            id="li-auto-i6-scenarios-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            理想 i6 · {scenarios.length} 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景选择升级方向；点击场景卡片查看对应项目。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((s) => (
            <a
              key={s.key}
              href={`#scenario-${s.key}`}
              onClick={() => handleScenarioClick(s)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-orange-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-1.5">
                {s.name}
              </h3>
              <p className="text-xs text-orange-300 mb-3 leading-relaxed">
                {s.description}
              </p>
              <p className="text-xs text-zinc-500 mb-2">
                含 {s.projectKeys.length} 个项目
              </p>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {s.projectKeys.map((projectKey) => {
                  const name = projectNameByKey.get(projectKey) ?? projectKey;
                  return (
                    <span
                      key={projectKey}
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
