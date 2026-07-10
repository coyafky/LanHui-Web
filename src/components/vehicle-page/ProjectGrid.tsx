import type { ProjectConfig, VehicleTheme } from "./vehicle-page.schema";

const THEME_CARD_BORDER: Record<VehicleTheme, string> = {
  orange: "border-orange-500/20 hover:border-orange-500/40",
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
  amber: "border-amber-500/20 hover:border-amber-500/40",
  blue: "border-blue-500/20 hover:border-blue-500/40",
  green: "border-emerald-500/20 hover:border-emerald-500/40",
  red: "border-red-500/20 hover:border-red-500/40",
  neutral: "border-zinc-700 hover:border-zinc-600",
};

interface Props {
  projects: ProjectConfig[];
  theme: VehicleTheme;
}

export function ProjectGrid({ projects, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">升级项目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border bg-zinc-900 p-5 transition-colors ${THEME_CARD_BORDER[theme]}`}
            >
              <h3 className="text-lg font-semibold text-white mb-2">{p.name}</h3>
              <p className="text-sm text-zinc-400 mb-3">{p.summary}</p>
              {p.suitableFor.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.suitableFor.map((s) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {p.caution && (
                <p className="mt-3 text-xs text-amber-400">⚠ {p.caution}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
