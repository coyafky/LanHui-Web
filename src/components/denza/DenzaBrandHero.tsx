import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

type DenzaBrandHeroProps = {
  totalModels: number;
  totalProjects: number;
  breadcrumbItems?: readonly BreadcrumbItem[];
};

/**
 * 腾势品牌专题 Hero（粉色主题）
 * PRD §6：标题 / 副标 / 统计 / 面包屑
 * 主题色 pink（与腾势系列一致）
 */
export function DenzaBrandHero({
  totalModels,
  totalProjects,
  breadcrumbItems,
}: DenzaBrandHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-pink-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-pink-700/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-pink-900/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-sm tracking-widest text-pink-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              DENZA UPGRADE
            </p>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
              腾势轻改方案
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-6">
              蓝辉轻改整理腾势热门车型的轻改与膜系方案
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-sm px-3 py-1.5 rounded-md bg-pink-950/40 border border-pink-900/60 text-pink-400">
                {totalModels} 款车型
              </span>
              <span className="text-sm px-3 py-1.5 rounded-md bg-pink-950/40 border border-pink-900/60 text-pink-400">
                {totalProjects} 个升级项目
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-pink-950/20 via-zinc-900 to-zinc-950">
              <div
                className="absolute inset-0 flex items-center justify-center"
                aria-hidden
              >
                <div className="text-center">
                  <p className="text-6xl font-bold text-pink-900/20">Denza</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
