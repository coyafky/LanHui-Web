"use client";

import { ArrowRight } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import type {
  TeslaProject,
  TeslaScenario,
} from "@/lib/tesla-products";

type TeslaScenarioMatrixProps = {
  scenarios: readonly TeslaScenario[];
  allProjects: readonly TeslaProject[];
};

const SCENARIO_LENGTH = 6;
const PREVIEW_COUNT = 3;

function assertScenarioLength(scenarios: readonly TeslaScenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `TeslaScenarioMatrix expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

/**
 * 6 大用车场景分类矩阵（Client Component）
 * PRD §8：3 列 / md:2 / sm:1，每卡：场景名 + 描述 + 项目数 + 前 3 项目名 + "查看完整方案"
 * 点击 → 滚动到 scenario-group-{key} + 触发埋点
 */
export function TeslaScenarioMatrix({
  scenarios,
  allProjects,
}: TeslaScenarioMatrixProps) {
  assertScenarioLength(scenarios);

  const projectNameByKey = new Map<string, string>(
    allProjects.map((p) => [p.key, p.name] as const),
  );

  function handleScenarioClick(scenario: TeslaScenario) {
    const targetId = `scenario-group-${scenario.key}`;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    trackClick("tesla_scenario_click", {
      scenarioKey: scenario.key,
    });
  }

  return (
    <section
      className="py-16 md:py-20 bg-black border-y border-zinc-900"
      aria-labelledby="tesla-scenarios-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-red-400 mb-3">
            SCENARIOS
          </p>
          <h2
            id="tesla-scenarios-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            6 大用车场景
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按场景找升级方案，对应不同项目组合
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {scenarios.map((s) => {
            const previewNames = s.projectKeys
              .map((k) => projectNameByKey.get(k))
              .filter((name): name is string => Boolean(name))
              .slice(0, PREVIEW_COUNT);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => handleScenarioClick(s)}
                aria-label={`查看 ${s.name} 完整方案`}
                className="group bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-red-700/60 transition-colors p-5 flex flex-col text-left"
              >
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {s.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                  {s.description}
                </p>
                <Badge
                  variant="outline"
                  className="border-red-900/60 text-red-400 bg-red-950/40 self-start mb-3"
                >
                  {`共 ${s.projectKeys.length} 个项目`}
                </Badge>
                <ul className="space-y-1 text-xs text-zinc-500 mb-4 flex-1">
                  {previewNames.map((name) => (
                    <li key={name} className="line-clamp-1">
                      · {name}
                    </li>
                  ))}
                </ul>
                <span className="inline-flex items-center text-sm font-medium text-red-400 group-hover:text-red-300 transition-colors">
                  查看完整方案
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
