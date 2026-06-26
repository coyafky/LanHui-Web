import Link from "next/link";
import { ChevronRight, ImageIcon } from "lucide-react";
import { PhoneCta } from "@/components/cta/PhoneCta";
import { getModelRoute } from "@/lib/product-routes";

type WenjieSeriesHeroProps = {
  title: string;
  subtitle: string;
  totalProjects: number;
  totalModels: number;
};

type SubModelAnchor = { modelKey: "M6" | "M7" | "M8"; label: string; href: string };

const SUB_MODEL_ANCHORS: readonly SubModelAnchor[] = (() => {
  const keys = ["m6", "m7", "m8"] as const;
  const labels: Record<"M6" | "M7" | "M8", string> = {
    M6: "问界 M6",
    M7: "问界 M7",
    M8: "问界 M8",
  };
  return keys.flatMap((slug) => {
    const route = getModelRoute("wenjie", slug);
    if (!route) return [];
    return [{ modelKey: route.modelName.split(" ")[1] as "M6" | "M7" | "M8", label: labels[route.modelName.split(" ")[1] as "M6" | "M7" | "M8"], href: route.canonicalPath }];
  });
})();

/**
 * 一级专题页 Hero
 * PRD §3 / §6：标题 / 副标 / 统计 / CTA / 面包屑 / 系列预览图占位
 * 主题色：cyan（与既有 WenjieTopicBanner 一致）
 */
export function WenjieSeriesHero({
  title,
  subtitle,
  totalProjects,
  totalModels,
}: WenjieSeriesHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-cyan-700/20 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        <nav className="flex items-center text-sm text-zinc-500 mb-6">
          <Link
            href="/product"
            className="hover:text-white transition-colors"
          >
            产品中心
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">问界系列升级方案</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-sm tracking-widest text-cyan-400 mb-3">
              WENJIE SERIES UPGRADE
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-6">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                {totalProjects} 个升级项目
              </span>
              <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                {totalModels} 个车型
              </span>
              <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                M6 / M7 / M8
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PhoneCta
                source="wenjie_series_hero_phone"
                label="电话咨询"
                size="lg"
                metadata={{ section: "hero" }}
              />
              <div className="flex flex-wrap items-center gap-2">
                {SUB_MODEL_ANCHORS.map((m) => (
                  <Link
                    key={m.modelKey}
                    href={m.href}
                    className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-700/60 text-sm transition-colors"
                  >
                    {m.label} 子页
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              role="img"
              aria-label="问界系列升级款式预览图"
              className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center text-zinc-500"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-zinc-950 to-zinc-950" aria-hidden />
              <ImageIcon className="w-12 h-12 mb-3 relative" aria-hidden />
              <p className="text-sm relative">系列预览图</p>
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">
              系列预览图待补；不代表安装案例
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
