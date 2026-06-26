export type WenjieModelServiceFlowProps = {
  steps: readonly { step: number; title: string; description: string }[];
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
};

/**
 * 二级页 7 步服务流程 — M6 / M7 / M8 共用
 * 4 列 / md:2 / sm:1
 * 数据层字段名：description（不是 desc）
 */
export function WenjieModelServiceFlow({
  steps,
  modelKey,
  modelName,
}: WenjieModelServiceFlowProps) {
  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby={`wenjie-${modelKey.toLowerCase()}-service-heading`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            SERVICE FLOW
          </p>
          <h2
            id={`wenjie-${modelKey.toLowerCase()}-service-heading`}
            className="text-2xl md:text-3xl font-bold text-white"
          >
            {`${modelName} · 到店服务流程`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mt-2">
            {`${steps.length} 步流程，从确认车型到售后支持`}
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((s) => (
            <li
              key={s.step}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
            >
              <p className="text-2xl font-bold text-cyan-400 mb-2">
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
