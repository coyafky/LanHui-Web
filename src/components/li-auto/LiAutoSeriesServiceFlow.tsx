import type { LiAutoSeriesServiceStep } from "@/lib/li-auto-series-upgrade-projects";

type LiAutoSeriesServiceFlowProps = {
  steps: readonly LiAutoSeriesServiceStep[];
};

const STEP_COUNT = 6;

function assertStepCount(steps: readonly LiAutoSeriesServiceStep[]): void {
  if (steps.length !== STEP_COUNT) {
    throw new Error(
      `LiAutoSeriesServiceFlow expects ${STEP_COUNT} steps, got ${steps.length}`,
    );
  }
}

/**
 * 6 步服务流程（PRD §11）
 * 桌面端水平排列，移动端垂直排列
 */
export function LiAutoSeriesServiceFlow({ steps }: LiAutoSeriesServiceFlowProps) {
  assertStepCount(steps);

  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            SERVICE FLOW
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            施工服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            到店评估、按标准流程施工
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col items-center text-center"
            >
              <span className="text-2xl font-bold text-amber-400 mb-2">
                {String(s.step).padStart(2, "0")}
              </span>
              <h3 className="text-sm font-bold text-white mb-1">{s.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
