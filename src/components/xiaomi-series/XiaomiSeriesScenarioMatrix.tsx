"use client";

import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { trackClick } from "@/lib/analytics";
import type {
  XiaomiSeriesScenario,
  XiaomiSeriesUpgradeProject,
} from "@/lib/xiaomi-series-upgrade-projects";

export type XiaomiSeriesScenarioMatrixProps = {
  scenarios: readonly XiaomiSeriesScenario[];
  allProjects: readonly XiaomiSeriesUpgradeProject[];
};

const SCENARIO_LENGTH = 7;
const scenarioIndexLabels = ["01", "02", "03", "04", "05", "06", "07"] as const;

function assertScenarioLength(scenarios: readonly XiaomiSeriesScenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `XiaomiSeriesScenarioMatrix expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

export function XiaomiSeriesScenarioMatrix({
  scenarios,
  allProjects,
}: XiaomiSeriesScenarioMatrixProps) {
  assertScenarioLength(scenarios);

  const projectNameById = new Map<string, string>(
    allProjects.map((p) => [p.id, p.name] as const),
  );

  const handleScenarioClick = useCallback(
    (scenario: XiaomiSeriesScenario) => {
      trackClick("xiaomi_series_scenario_click", {
        scenarioId: scenario.id,
        scenarioName: scenario.name,
      });
    },
    [],
  );

  return (
    <section className="relative py-20 md:py-24 bg-black border-y border-zinc-900 overflow-hidden">
      <div className="absolute inset-0 -z-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-orange-950/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-950/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-orange-600/60"
              aria-hidden
            />
            <p className="text-xs tracking-[0.25em] text-orange-400 uppercase">
              Scenarios
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            按场景找升级方案
          </h2>
          <p className="text-zinc-500 text-sm md:text-base max-w-xl">
            7 大用车场景，对应不同项目组合。从新车保护到 Ultra 风格，按需挑选。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {scenarios.map((s, idx) => {
            const projectNames = s.projectIds
              .map((id) => projectNameById.get(id))
              .filter((name): name is string => Boolean(name));
            const indexLabel = scenarioIndexLabels[idx] ?? String(idx + 1);
            const isLastAlone =
              idx === scenarios.length - 1 && scenarios.length % 3 === 1;

            return (
              <a
                key={s.id}
                href={`#scenario-${s.id}`}
                onClick={() => handleScenarioClick(s)}
                className={`group relative bg-zinc-900/80 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-300 flex flex-col overflow-hidden ${
                  isLastAlone ? "lg:col-span-3 lg:max-w-sm lg:mx-auto lg:w-full" : ""
                }`}
              >
                <div
                  className="h-0.5 bg-gradient-to-r from-orange-500/70 via-orange-400/40 to-transparent shrink-0"
                  aria-hidden
                />

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
                      {s.name}
                    </h3>
                    <span
                      className="text-3xl font-bold text-zinc-800 group-hover:text-orange-900/60 transition-colors duration-300 leading-none shrink-0"
                      aria-hidden
                    >
                      {indexLabel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                    {s.description}
                  </p>

                  <Badge
                    variant="outline"
                    className="border-orange-800/40 text-orange-400/80 bg-orange-950/20 self-start mb-4 text-[11px]"
                  >
                    {s.projectIds.length} 个项目
                  </Badge>

                  <ul className="space-y-2 flex-1">
                    {projectNames.map((name) => (
                      <li
                        key={name}
                        className="flex items-center gap-2.5 text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300"
                      >
                        <span
                          className="block w-1 h-1 rounded-full bg-orange-500/50 shrink-0"
                          aria-hidden
                        />
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
