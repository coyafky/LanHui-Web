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

interface Props {
  config: HeroConfig;
  theme: VehicleTheme;
}

export function VehicleHero({ config, theme }: Props) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-700/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full opacity-15 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-16 md:py-40">
        <p
          className={`inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border text-xs tracking-widest ${THEME_BADGE[theme]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${THEME_DOT[theme]}`} />
          {config.badge}
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight text-white">
          {config.title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3">
          {config.subtitle}
        </p>
        <p className="text-base sm:text-lg md:text-xl text-zinc-300 mb-10 leading-relaxed">
          {config.description}
        </p>
      </div>
    </section>
  );
}
