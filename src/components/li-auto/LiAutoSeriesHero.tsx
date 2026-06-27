import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getModelRoute } from "@/lib/product-routes";

type LiAutoSeriesHeroProps = {
  title: string;
  subtitle: string;
  totalProjects: number;
  totalModels: number;
};

type SubModelAnchor = { label: string; href: string; isPlanned: boolean };

const SUB_MODEL_ANCHORS: readonly SubModelAnchor[] = (() => {
  const entries = [
    { slug: "i8", label: "理想 i8" },
    { slug: "l9", label: "理想 L9" },
    { slug: "mega", label: "理想 MEGA" },
  ] as const;
  return entries.flatMap(({ slug, label }) => {
    const route = getModelRoute("li-auto", slug);
    if (!route) return [];
    return [{ label, href: route.canonicalPath, isPlanned: route.status === "planned" }];
  });
})();

/**
 * 一级专题页 Hero（amber 主题）
 * PRD §6：标题 / 副标 / 统计 / 面包屑
 * 主题色 amber（与理想系列一致）
 */
export function LiAutoSeriesHero({
  title,
  subtitle,
  totalProjects,
  totalModels,
}: LiAutoSeriesHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-amber-700/20 blur-3xl" />
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
          <span className="text-zinc-300">理想系列升级方案</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-sm tracking-widest text-amber-400 mb-3">
              LI AUTO SERIES UPGRADE
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
                i8 / L9 / MEGA
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {SUB_MODEL_ANCHORS.map((m) => (
                  <Link
                    key={m.label}
                    href={m.href}
                    className={`inline-flex items-center px-3 py-2 rounded-md border text-sm transition-colors ${
                      m.isPlanned
                        ? "border-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60"
                    }`}
                    {...(m.isPlanned ? { "aria-disabled": true, tabIndex: -1 } : {})}
                  >
                    {m.label} 子页
                    {m.isPlanned && (
                      <span className="ml-2 text-[10px] text-zinc-600">整理中</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-amber-950/20 via-zinc-900 to-zinc-950">
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div className="text-center">
                  <p className="text-6xl font-bold text-amber-900/20">Li</p>
                  <p className="text-xs text-zinc-600 mt-4">功能预览图 · 后续补充</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
