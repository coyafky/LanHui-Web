import type { DenzaD9ServiceStep } from "@/lib/denza-d9-products";

type DenzaD9ServiceFlowProps = {
  steps: readonly DenzaD9ServiceStep[];
};

const STEP_LENGTH = 6;

function assertStepLength(steps: readonly DenzaD9ServiceStep[]): void {
  if (steps.length !== STEP_LENGTH) {
    throw new Error(
      `DenzaD9ServiceFlow expects ${STEP_LENGTH} steps, got ${steps.length}`,
    );
  }
}

/**
 * 6 步到店服务流程（Server Component）
 */
export function DenzaD9ServiceFlow({ steps }: DenzaD9ServiceFlowProps) {
  assertStepLength(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="denza-d9-service-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="denza-d9-service-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            腾势 D9 · 服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            到店确认配置差异后，再确定材料、组合和施工排期。
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s) => (
            <li
              key={s.order}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-orange-400 mb-2">
                {s.order.toString().padStart(2, "0")}
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
