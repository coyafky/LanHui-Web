import type { ScenarioConfig, VehicleTheme } from "./vehicle-page.schema";

const THEME_ACCENT: Record<VehicleTheme, string> = {
  orange: "border-orange-500/20 bg-orange-500/5",
  cyan: "border-cyan-500/20 bg-cyan-500/5",
  amber: "border-amber-500/20 bg-amber-500/5",
  blue: "border-blue-500/20 bg-blue-500/5",
  green: "border-emerald-500/20 bg-emerald-500/5",
  red: "border-red-500/20 bg-red-500/5",
  neutral: "border-zinc-700 bg-zinc-800/50",
};

interface Props {
  scenarios: ScenarioConfig[];
  theme: VehicleTheme;
}

export function ScenarioMatrix({ scenarios, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">使用场景</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border p-5 ${THEME_ACCENT[theme]}`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{s.name}</h3>
              <p className="text-sm text-zinc-400">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
