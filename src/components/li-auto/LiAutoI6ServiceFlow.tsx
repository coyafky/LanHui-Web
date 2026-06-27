import type { LiAutoI6ServiceStep } from "@/lib/li-auto-i6-products";

type LiAutoI6ServiceFlowProps = {
  steps: readonly LiAutoI6ServiceStep[];
};

export function LiAutoI6ServiceFlow({ steps }: LiAutoI6ServiceFlowProps) {
  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">SERVICE FLOW</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            施工服务流程
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            从车型确认到售后支持，7 步流程覆盖施工全过程
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {steps.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-3"
            >
              <span className="text-3xl font-bold text-amber-400/60 select-none">
                {String(step.step).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-bold text-white">{step.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
