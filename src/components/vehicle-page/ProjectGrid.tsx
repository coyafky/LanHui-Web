import Image from "next/image";
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

/** 1x1 灰图 base64 placeholder */
const BLUR_DATA_URL =
  "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/v3AgAA=";

interface Props {
  projects: ProjectConfig[];
  theme: VehicleTheme;
}

function ProjectImage({ p }: { p: ProjectConfig }) {
  if (!p.imagePublicPath) return null;

  return (
    <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-zinc-800">
      <Image
        src={p.imagePublicPath}
        alt={p.imageAlt ?? p.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
      {p.imageStatus && p.imageStatus !== "matched" && (
        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs rounded bg-amber-900/80 text-amber-400 border border-amber-700/50">
          {p.imageStatus === "product-preview" ? "预览图" : "待复核"}
        </span>
      )}
    </div>
  );
}

export function ProjectGrid({ projects, theme }: Props) {
  return (
    <section className="py-16 md:py-20 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">升级项目</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border bg-zinc-900 overflow-hidden transition-colors ${THEME_CARD_BORDER[theme]}`}
            >
              <ProjectImage p={p} />
              <div className="p-5 pt-0">
                {p.imagePublicPath && <div className="h-0" />}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
