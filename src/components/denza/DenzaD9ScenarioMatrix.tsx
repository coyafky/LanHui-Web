"use client";

import { useCallback } from "react";
import { trackClick } from "@/lib/analytics";
import type {
  DenzaD9Scenario,
  DenzaD9UpgradeProject,
} from "@/lib/denza-d9-products";

type DenzaD9ScenarioMatrixProps = {
  scenarios: readonly DenzaD9Scenario[];
  allProjects: readonly DenzaD9UpgradeProject[];
};

const SCENARIO_LENGTH = 5;

function assertScenarioLength(scenarios: readonly DenzaD9Scenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `DenzaD9ScenarioMatrix expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

export function DenzaD9ScenarioMatrix({
  scenarios,
  allProjects,
}: DenzaD9ScenarioMatrixProps) {
  assertScenarioLength(scenarios);

  const projectNameById = new Map<string, string>(
    allProjects.map((p) => [p.id, p.name] as const),
  );

  const handleScenarioClick = useCallback((scenario: DenzaD9Scenario) => {
    trackClick("denza_d9_scenario_click", {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      projectCount: scenario.projectIds.length,
    });
  }, []);

  return (
    <section
      className="py-16 md:py-20 bg-black border-t border-zinc-900"
      aria-labelledby="denza-d9-scenarios-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SCENARIOS
          </p>
          <h2
            id="denza-d9-scenarios-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            腾势 D9 · {scenarios.length} 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景选择升级方向；点击场景卡片查看对应项目。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((s) => (
            <a
              key={s.id}
              href={`#scenario-${s.id}`}
              onClick={() => handleScenarioClick(s)}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-orange-500/70 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-1.5">
                {s.name}
              </h3>
              <p className="text-xs text-orange-200 mb-3 leading-relaxed">
                {s.description}
              </p>

              <p className="text-xs text-zinc-500 mb-2">
                含 {s.projectIds.length} 个项目
              </p>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {s.projectIds.map((pid) => {
                  const name = projectNameById.get(pid) ?? pid;
                  return (
                    <span
                      key={pid}
                      className="text-xs px-2 py-1 rounded-md border border-orange-900/60 text-orange-300 bg-orange-950/20"
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
