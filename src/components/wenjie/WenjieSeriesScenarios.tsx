import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type {
  WenjieSeriesScenario,
  WenjieSeriesUpgradeProject,
} from "@/lib/wenjie-series-upgrade-projects";

type WenjieSeriesScenariosProps = {
  scenarios: readonly WenjieSeriesScenario[];
  allProjects: readonly WenjieSeriesUpgradeProject[];
};

const SCENARIO_LENGTH = 7;
const SCENARIO_ANCHOR_ID = "scenarios-detail";

function assertScenarioLength(scenarios: readonly WenjieSeriesScenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `WenjieSeriesScenarios expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

/**
 * 7 大用车场景（PRD §8）
 * 每卡：场景名 + 描述 + 项目数 + 前 3 项目 + 锚点跳转至 WenjieSeriesMoreChoices
 */
export function WenjieSeriesScenarios({
  scenarios,
  allProjects,
}: WenjieSeriesScenariosProps) {
  assertScenarioLength(scenarios);

  const projectNameByKey = new Map<string, string>(
    allProjects.map((p) => [p.key, p.name] as const),
  );

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            SCENARIOS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            按场景找升级方案
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            7 大用车场景，对应不同项目组合
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((s) => {
            const previewNames = s.projectKeys
              .map((k) => projectNameByKey.get(k))
              .filter((name): name is string => Boolean(name))
              .slice(0, 3);
            return (
              <article
                key={s.key}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col"
              >
                <h3 className="text-lg font-bold text-white mb-2">{s.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {s.description}
                </p>
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30 self-start mb-3"
                >
                  共 {s.projectKeys.length} 个项目
                </Badge>
                <ul className="space-y-1 text-sm text-zinc-300 mb-4 flex-1">
                  {previewNames.map((name) => (
                    <li key={name} className="line-clamp-1">
                      · {name}
                    </li>
                  ))}
                </ul>
                <a
                  href={`#${SCENARIO_ANCHOR_ID}`}
                  className="inline-flex items-center text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  查看完整方案
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}