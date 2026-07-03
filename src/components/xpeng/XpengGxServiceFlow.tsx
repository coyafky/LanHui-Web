import type { XpengGxServiceStep } from "@/lib/xpeng-gx-products";

type XpengGxServiceFlowProps = {
  steps: readonly XpengGxServiceStep[];
};

const STEP_LENGTH = 7;

function assertStepLength(steps: readonly XpengGxServiceStep[]): void {
  if (steps.length !== STEP_LENGTH) {
    throw new Error(
      `XpengGxServiceFlow expects ${STEP_LENGTH} steps, got ${steps.length}`,
    );
  }
}

/**
 * 7 步到店服务流程（Server Component）
 * 结构一比一对齐极氪 9X 服务流程，orange 数字 + 中性色文字。
 */
export function XpengGxServiceFlow({ steps }: XpengGxServiceFlowProps) {
  assertStepLength(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="xpeng-gx-service-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="xpeng-gx-service-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            小鹏 GX · 7 步到店服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            从车型确认到售后支持，按标准流程推进。
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {steps.map((s) => (
            <li
              key={s.step}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  aria-hidden
                  className="text-2xl font-bold text-orange-400 w-9 h-9 flex items-center justify-center rounded-md bg-orange-950/40 border border-orange-800/60"
                >
                  {s.step.toString().padStart(2, "0")}
                </span>
                <h3 className="text-base font-bold text-white">{s.title}</h3>
              </div>
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
