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

const scenarioIndexLabels = ["01", "02", "03", "04", "05", "06", "07"] as const;

function assertScenarioLength(scenarios: readonly WenjieSeriesScenario[]): void {
  if (scenarios.length !== SCENARIO_LENGTH) {
    throw new Error(
      `WenjieSeriesScenarios expects ${SCENARIO_LENGTH} scenarios, got ${scenarios.length}`,
    );
  }
}

/**
 * 7 大用车场景（PRD §8）
 *
 * 设计方向：奢华展厅 × 编辑级排版
 * - 顶部 header 带指示符与微妙的装饰点缀
 * - 卡片顶部有青色的强调条纹，暗示汽车速度与精准
 * - 3 列桌面布局，尾部单卡优雅居中
 * - 作业列表采用圆点标记，项目间带有微妙的青色引导色
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
    <section className="relative py-20 md:py-24 bg-black border-y border-zinc-900 overflow-hidden">
      {/* 背景纹理 — 微妙的青色对角线，暗示汽车/速度 */}
      <div className="absolute inset-0 -z-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-950/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-950/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ---- 区块头部 ---- */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-cyan-600/60"
              aria-hidden
            />
            <p className="text-xs tracking-[0.25em] text-cyan-400 uppercase">
              Scenarios
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            按场景找升级方案
          </h2>
          <p className="text-zinc-500 text-sm md:text-base max-w-xl">
            7 大用车场景，对应不同项目组合。从新车保护到户外露营，按需挑选。
          </p>
        </div>

        {/* ---- 场景卡片网格 ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {scenarios.map((s, idx) => {
            const projectNames = s.projectKeys
              .map((k) => projectNameByKey.get(k))
              .filter((name): name is string => Boolean(name));
            const indexLabel = scenarioIndexLabels[idx] ?? String(idx + 1);
            const isLastAlone =
              idx === scenarios.length - 1 && scenarios.length % 3 === 1;

            return (
              <article
                key={s.key}
                className={`group relative bg-zinc-900/80 rounded-2xl border border-zinc-800/80 hover:border-zinc-700/80 transition-colors duration-300 flex flex-col overflow-hidden ${
                  isLastAlone ? "lg:col-span-3 lg:max-w-sm lg:mx-auto lg:w-full" : ""
                }`}
              >
                {/* 顶部青色强调条纹 */}
                <div
                  className="h-0.5 bg-gradient-to-r from-cyan-500/70 via-cyan-400/40 to-transparent shrink-0"
                  aria-hidden
                />

                <div className="p-5 md:p-6 flex flex-col flex-1">
                  {/* 索引 + 标题行 */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
                      {s.name}
                    </h3>
                    <span
                      className="text-3xl font-bold text-zinc-800 group-hover:text-cyan-900/60 transition-colors duration-300 leading-none shrink-0"
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
                    className="border-cyan-800/40 text-cyan-400/80 bg-cyan-950/20 self-start mb-4 text-[11px]"
                  >
                    {s.projectKeys.length} 个项目
                  </Badge>

                  {/* 项目列表 */}
                  <ul className="space-y-2 flex-1">
                    {projectNames.map((name) => (
                      <li
                        key={name}
                        className="flex items-center gap-2.5 text-sm text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300"
                      >
                        <span
                          className="block w-1 h-1 rounded-full bg-cyan-500/50 shrink-0"
                          aria-hidden
                        />
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
