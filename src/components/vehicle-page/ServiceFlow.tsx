import type { ServiceFlowConfig, ServiceFlowStep, VehicleTheme } from "./vehicle-page.schema";

const THEME_LINE: Record<VehicleTheme, string> = {
  orange: "border-orange-500/30",
  cyan: "border-cyan-500/30",
  amber: "border-amber-500/30",
  blue: "border-blue-500/30",
  green: "border-emerald-500/30",
  red: "border-red-500/30",
  neutral: "border-zinc-700",
};

interface Props {
  config: ServiceFlowConfig;
  theme: VehicleTheme;
}

export function ServiceFlow({ config, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {config.title && (
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
            {config.title}
          </h2>
        )}
        <div className="relative">
          {config.steps.map((step, i) => (
            <StepItem key={step.order} step={step} index={i} theme={theme} isLast={i === config.steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepItem({ step, index, theme, isLast }: { step: ServiceFlowStep; index: number; theme: VehicleTheme; isLast: boolean }) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-white font-bold text-sm shrink-0">
          {String(index + 1).padStart(2, "0")}
        </div>
        {!isLast && <div className={`w-px flex-1 my-2 border-l ${THEME_LINE[theme]}`} />}
      </div>
      <div className={`pb-10 ${isLast ? "pb-0" : ""}`}>
        <h3 className="text-lg font-semibold text-white">{step.title}</h3>
        <p className="text-sm text-zinc-400 mt-1">{step.description}</p>
      </div>
    </div>
  );
}
