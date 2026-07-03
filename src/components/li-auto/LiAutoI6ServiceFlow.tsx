import type { LiAutoI6ServiceStep } from "@/lib/li-auto-i6-products";

const EXPECTED_STEP_COUNT = 6;

type LiAutoI6ServiceFlowProps = {
  steps: readonly LiAutoI6ServiceStep[];
};

function assertStepCount(steps: readonly LiAutoI6ServiceStep[]): void {
  if (steps.length !== EXPECTED_STEP_COUNT) {
    throw new Error(
      `LiAutoI6ServiceFlow expects ${EXPECTED_STEP_COUNT} steps, got ${steps.length}`,
    );
  }
}

export function LiAutoI6ServiceFlow({ steps }: LiAutoI6ServiceFlowProps) {
  assertStepCount(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="li-auto-i6-service-flow-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="li-auto-i6-service-flow-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            理想 i6 · 服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            从车型确认到售后支持，按 6 步标准流程推进。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((step) => (
            <article
              key={step.order}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden
                  className="text-2xl font-bold text-orange-400 w-9 h-9 flex items-center justify-center rounded-md bg-orange-950/40 border border-orange-800/60"
                >
                  {String(step.order).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
