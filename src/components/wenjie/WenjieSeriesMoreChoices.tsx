import { Badge } from "@/components/ui/badge";
import type { WenjieSeriesUpgradeProject } from "@/lib/wenjie-series-upgrade-projects";

type WenjieSeriesMoreChoicesProps = {
  projects: readonly WenjieSeriesUpgradeProject[];
};

const OPTIONAL_LENGTH = 24;
const SCENARIO_ANCHOR_ID = "scenarios-detail";

function assertOptionalLength(projects: readonly WenjieSeriesUpgradeProject[]): void {
  if (projects.length !== OPTIONAL_LENGTH) {
    throw new Error(
      `WenjieSeriesMoreChoices expects ${OPTIONAL_LENGTH} optional projects, got ${projects.length}`,
    );
  }
}

/**
 * 24 更多选择紧凑卡片（PRD §9.1）
 * 4 列 / md:3 / sm:2，no image，name + summary + 功能提示
 */
export function WenjieSeriesMoreChoices({ projects }: WenjieSeriesMoreChoicesProps) {
  assertOptionalLength(projects);

  return (
    <section
      id={SCENARIO_ANCHOR_ID}
      className="py-16 md:py-20 bg-zinc-950 scroll-mt-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            MORE OPTIONS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            更多选择 · 24 个项目
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            覆盖外观升级、座舱舒适、户外露营等更多用车场景
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {projects.map((p) => (
            <article
              key={p.key}
              id={p.key}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30"
                >
                  {p.order.toString().padStart(2, "0")}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-700 text-zinc-300"
                >
                  {p.category}
                </Badge>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">
                问界系列 {p.name}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3 flex-1">
                {p.summary}
              </p>
              <div className="mt-auto h-1.5 rounded-full bg-gradient-to-r from-cyan-500/70 via-sky-400/30 to-transparent" />
              <p className="mt-2 text-[11px] text-zinc-500">
                可按 M6 / M7 / M8 车型确认适配
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
