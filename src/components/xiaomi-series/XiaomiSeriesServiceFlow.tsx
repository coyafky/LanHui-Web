import type { XiaomiSeriesServiceStep } from "@/lib/xiaomi-series-upgrade-projects";
import { XIAOMI_SERIES_SERVICE_STEP_COUNT } from "@/lib/xiaomi-series-upgrade-projects";

const EXPECTED_STEP_COUNT = XIAOMI_SERIES_SERVICE_STEP_COUNT;

function assertStepCount(steps: readonly XiaomiSeriesServiceStep[]): void {
  if (steps.length !== EXPECTED_STEP_COUNT) {
    throw new Error(
      `XiaomiSeriesServiceFlow expects ${EXPECTED_STEP_COUNT} steps, got ${steps.length}`,
    );
  }
}

export type XiaomiSeriesServiceFlowProps = {
  steps: readonly XiaomiSeriesServiceStep[];
};

export function XiaomiSeriesServiceFlow({ steps }: XiaomiSeriesServiceFlowProps) {
  assertStepCount(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="xiaomi-series-service-flow-heading"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="xiaomi-series-service-flow-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            到店沟通流程 · 7 步
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((s) => (
            <li
              key={s.order}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-orange-400 mb-2">
                {String(s.order).padStart(2, "0")}
              </p>
              <p className="text-sm font-bold text-white mb-1">{s.title}</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
