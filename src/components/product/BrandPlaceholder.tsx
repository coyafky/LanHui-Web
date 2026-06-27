import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import type { AccentColor, ProductRouteStatus } from "@/lib/product-routes";

type BrandPlaceholderProps = {
  title: string;
  subtitle?: string;
  status: ProductRouteStatus;
  accentColor: AccentColor;
  models?: readonly { name: string; href?: string }[];
  serviceMeta?: { group: string; priority: string };
  backHref?: string;
};

const ACCENT_CLASSES: Record<
  AccentColor,
  { text: string; border: string; bg: string; pill: string }
> = {
  cyan:    { text: "text-cyan-400",    border: "border-cyan-800/50",    bg: "bg-cyan-950/20",    pill: "bg-cyan-950/30 text-cyan-300 border-cyan-800/50" },
  orange:  { text: "text-orange-400",  border: "border-orange-800/50",  bg: "bg-orange-950/20",  pill: "bg-orange-950/30 text-orange-300 border-orange-800/50" },
  amber:   { text: "text-amber-400",   border: "border-amber-800/50",   bg: "bg-amber-950/20",   pill: "bg-amber-950/30 text-amber-300 border-amber-800/50" },
  emerald: { text: "text-emerald-400", border: "border-emerald-800/50", bg: "bg-emerald-950/20", pill: "bg-emerald-950/30 text-emerald-300 border-emerald-800/50" },
  violet:  { text: "text-violet-400",  border: "border-violet-800/50",  bg: "bg-violet-950/20",  pill: "bg-violet-950/30 text-violet-300 border-violet-800/50" },
  pink:    { text: "text-pink-400",    border: "border-pink-800/50",    bg: "bg-pink-950/20",    pill: "bg-pink-950/30 text-pink-300 border-pink-800/50" },
  blue:    { text: "text-blue-400",    border: "border-blue-800/50",    bg: "bg-blue-950/20",    pill: "bg-blue-950/30 text-blue-300 border-blue-800/50" },
  teal:    { text: "text-teal-400",    border: "border-teal-800/50",    bg: "bg-teal-950/20",    pill: "bg-teal-950/30 text-teal-300 border-teal-800/50" },
  red:     { text: "text-red-400",     border: "border-red-800/50",     bg: "bg-red-950/20",     pill: "bg-red-950/30 text-red-300 border-red-800/50" },
  sky:     { text: "text-sky-400",     border: "border-sky-800/50",     bg: "bg-sky-950/20",     pill: "bg-sky-950/30 text-sky-300 border-sky-800/50" },
} as const;

function getEyebrowLabel(
  status: ProductRouteStatus,
  hasModels: boolean,
  hasServiceMeta: boolean
): string {
  if (hasServiceMeta) return "SERVICE PAGE";
  if (hasModels) return status === "live" ? "BRAND TOPIC" : "MODEL TOPIC";
  return "BRAND TOPIC";
}

export function BrandPlaceholder({
  title,
  subtitle,
  status,
  accentColor,
  models,
  serviceMeta,
  backHref = "/product",
}: BrandPlaceholderProps) {
  const accent = ACCENT_CLASSES[accentColor];
  const hasModels = !!models && models.length > 0;
  const eyebrow = getEyebrowLabel(status, hasModels, !!serviceMeta);

  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 bg-zinc-950 text-white">
      <p className={`text-xs tracking-widest ${accent.text} mb-4 uppercase`}>{eyebrow}</p>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">{title}</h1>
      {subtitle ? (
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl text-center mb-10">{subtitle}</p>
      ) : (
        <div className="mb-10" />
      )}

      {status === "planned" ? (
        <div
          className={`max-w-xl w-full rounded-2xl ${accent.border} ${accent.bg} p-6 md:p-8 text-center`}
        >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${accent.bg} ${accent.text} mb-4`}>
            <Wrench className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold mb-2">方案整理中</h2>
          <p className="text-sm md:text-base text-zinc-400 mb-6">
            内容由团队完善中，敬请期待。具体方案可到店沟通。
          </p>
          <Link
            href={backHref}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border ${accent.border} ${accent.text} hover:${accent.bg} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            返回产品中心
          </Link>
        </div>
      ) : null}

      {serviceMeta ? (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${accent.pill}`}>
            分组：{serviceMeta.group}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${accent.pill}`}>
            优先级：{serviceMeta.priority}
          </span>
        </div>
      ) : null}

      {hasModels ? (
        <div className="mt-10 w-full max-w-5xl">
          <p className="text-xs tracking-widest text-zinc-500 mb-4 text-center uppercase">已收录车型</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {models!.map((m) => {
              const cardClass = `group block rounded-xl border ${accent.border} ${accent.bg} p-4 text-center transition-colors hover:border-zinc-700`;
              const body = (
                <span className={`text-sm md:text-base font-medium ${accent.text}`}>{m.name}</span>
              );
              return m.href ? (
                <Link key={m.name} href={m.href} className={cardClass}>
                  {body}
                </Link>
              ) : (
                <div key={m.name} className={cardClass}>
                  {body}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
