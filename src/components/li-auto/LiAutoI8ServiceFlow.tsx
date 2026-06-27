import type { LiAutoI8ServiceStep } from "@/lib/li-auto-i8-products";

const EXPECTED_STEP_COUNT = 7;

function assertStepCount(steps: readonly LiAutoI8ServiceStep[]): void {
  if (steps.length !== EXPECTED_STEP_COUNT) {
    throw new Error(
      `LiAutoI8ServiceFlow expects ${EXPECTED_STEP_COUNT} steps, got ${steps.length}`,
    );
  }
}

export type LiAutoI8ServiceFlowProps = {
  steps: readonly LiAutoI8ServiceStep[];
};

/**
 * 理想 i8 7 步服务流程（RSC）
 * PRD §11：amber 数字 + 中性色文字；字面量 runtime check。
 */
export function LiAutoI8ServiceFlow({ steps }: LiAutoI8ServiceFlowProps) {
  assertStepCount(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="li-auto-i8-service-flow-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="li-auto-i8-service-flow-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            理想 i8 · 服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            从车型确认到售后支持，按 7 步标准流程推进。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <article
              key={s.step}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden
                  className="text-2xl font-bold text-amber-400 w-9 h-9 flex items-center justify-center rounded-md bg-amber-950/40 border border-amber-800/60"
                >
                  {String(s.step).padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
