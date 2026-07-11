import Image from "next/image";
import type { HeroConfig, VehicleTheme } from "./vehicle-page.schema";

const THEME_BADGE: Record<VehicleTheme, string> = {
  orange: "border-orange-600/60 bg-orange-500/10 text-orange-400",
  cyan: "border-cyan-600/60 bg-cyan-500/10 text-cyan-400",
  amber: "border-amber-600/60 bg-amber-500/10 text-amber-400",
  blue: "border-blue-600/60 bg-blue-500/10 text-blue-400",
  green: "border-emerald-600/60 bg-emerald-500/10 text-emerald-400",
  red: "border-red-600/60 bg-red-500/10 text-red-400",
  neutral: "border-zinc-600 bg-zinc-700/40 text-zinc-300",
};

const THEME_DOT: Record<VehicleTheme, string> = {
  orange: "bg-orange-400",
  cyan: "bg-cyan-400",
  amber: "bg-amber-400",
  blue: "bg-blue-400",
  green: "bg-emerald-400",
  red: "bg-red-400",
  neutral: "bg-zinc-400",
};

const THEME_GLOW: Record<VehicleTheme, string> = {
  orange: "from-orange-950/30 via-zinc-950 to-zinc-950",
  cyan: "from-cyan-950/30 via-zinc-950 to-zinc-950",
  amber: "from-amber-950/30 via-zinc-950 to-zinc-950",
  blue: "from-blue-950/40 via-zinc-950 to-zinc-950",
  green: "from-emerald-950/30 via-zinc-950 to-zinc-950",
  red: "from-red-950/30 via-zinc-950 to-zinc-950",
  neutral: "from-zinc-900 via-zinc-950 to-zinc-950",
};

const THEME_STAT_BORDER: Record<VehicleTheme, string> = {
  orange: "border-orange-500/30",
  cyan: "border-cyan-500/30",
  amber: "border-amber-500/30",
  blue: "border-blue-500/30",
  green: "border-emerald-500/30",
  red: "border-red-500/30",
  neutral: "border-zinc-700",
};

interface Props {
  config: HeroConfig;
  theme: VehicleTheme;
}

export function VehicleHero({ config, theme }: Props) {
  const hasImage = !!config.heroImage;
  const hasStats = !!config.stats;

  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className={`absolute inset-0 bg-gradient-to-br ${THEME_GLOW[theme]}`} />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-orange-700/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        <div className={`grid ${hasImage ? "grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center" : ""}`}>
          <div>
            <p
              className={`inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border text-xs tracking-widest ${THEME_BADGE[theme]}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${THEME_DOT[theme]}`} />
              {config.badge}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {config.title}
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-6">
              {config.subtitle}
            </p>
            {config.description && (
              <p className="text-sm text-zinc-500 max-w-xl leading-relaxed mb-6">
                {config.description}
              </p>
            )}

            {hasStats && (
              <div className="flex flex-wrap gap-4 mt-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${THEME_STAT_BORDER[theme]} bg-zinc-900/60`}>
                  <span className="text-2xl font-bold">{config.stats!.totalProjects}</span>
                  <span className="text-sm text-zinc-400">升级项目</span>
                </div>
                {config.stats!.totalScenarios && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60">
                    <span className="text-2xl font-bold text-white">{config.stats!.totalScenarios}</span>
                    <span className="text-sm text-zinc-400">用车场景</span>
                  </div>
                )}
                {config.stats!.totalModels && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900/60">
                    <span className="text-2xl font-bold text-white">{config.stats!.totalModels}</span>
                    <span className="text-sm text-zinc-400">车型</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {hasImage && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800">
              <Image
                src={config.heroImage!.src}
                alt={config.heroImage!.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
