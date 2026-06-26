import type { TeslaServiceStep } from "@/lib/tesla-products";

type TeslaServiceFlowProps = {
  steps: readonly TeslaServiceStep[];
};

const STEP_LENGTH = 6;

function assertStepLength(steps: readonly TeslaServiceStep[]): void {
  if (steps.length !== STEP_LENGTH) {
    throw new Error(
      `TeslaServiceFlow expects ${STEP_LENGTH} steps, got ${steps.length}`,
    );
  }
}

/**
 * 6 步到店服务流程（Server Component）
 * PRD §11：4 列 / md:3 / sm:1，红数字 + 标题 + 描述
 */
export function TeslaServiceFlow({ steps }: TeslaServiceFlowProps) {
  assertStepLength(steps);

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="tesla-service-heading"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-red-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id="tesla-service-heading"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            6 步到店服务流程
          </h2>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((s) => (
            <li
              key={s.step}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-red-400 mb-2">
                {s.step.toString().padStart(2, "0")}
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