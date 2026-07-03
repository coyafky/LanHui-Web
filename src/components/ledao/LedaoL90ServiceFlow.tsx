/**
 * 乐道 L90 — 施工服务流程 (Server Component)
 * PRD §11 流程：车型确认 → 项目选择 → 到店评估 → 施工安装 → 验收交付 → 售后支持
 * 主题色: orange，与极氪 9X 页面结构对齐
 */
import type { LedaoL90ServiceStep } from "@/lib/ledao-l90-products";

interface LedaoL90ServiceFlowProps {
  steps: readonly LedaoL90ServiceStep[];
}

const STEPS_LENGTH = 6;

function assertStepsLength(steps: readonly LedaoL90ServiceStep[]): void {
  if (steps.length !== STEPS_LENGTH) {
    throw new Error(
      `LedaoL90ServiceFlow expects ${STEPS_LENGTH} steps, got ${steps.length}`,
    );
  }
}

export function LedaoL90ServiceFlow({ steps }: LedaoL90ServiceFlowProps) {
  assertStepsLength(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="ledao-l90-service-flow-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="ledao-l90-service-flow-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            乐道 L90 · 服务流程
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
