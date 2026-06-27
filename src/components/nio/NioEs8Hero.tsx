import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type NioEs8HeroProps = {
  totalProjects: number;
  totalScenarios: number;
  totalBundles: number;
  canonicalPath: string;
};

const SCENARIO_ANCHORS: readonly {
  key: "protection" | "appearance" | "family_cabin" | "driving_protection";
  label: string;
}[] = [
  { key: "protection", label: "新车保护" },
  { key: "appearance", label: "外观个性" },
  { key: "family_cabin", label: "家庭座舱" },
  { key: "driving_protection", label: "行车防护" },
];

/**
 * NIO ES8 二级页 Hero（RSC）
 * PRD §6.1 / plan §C.1：
 *   - 面包屑 → 标题 → 副标 → 统计 chip → 4 场景锚点
 *   - 主题色 sky（PRD §0.3）
 *   - 无 CTA 按钮（架构 PRD §2.1：产品页不设计私有操作）
 *   - 无右侧 next/image（对齐 PRD §0.3：NIO 不挂海报组件）
 */
export function NioEs8Hero({
  totalProjects,
  totalScenarios,
  totalBundles,
  canonicalPath,
}: NioEs8HeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-sky-700/20 blur-3xl" />
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
          <Link
            href="/product/nio"
            className="hover:text-white transition-colors"
          >
            蔚来系列
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">蔚来 ES8</span>
        </nav>

        <p className="text-sm tracking-widest text-sky-400 mb-3">
          NIO ES8 UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          蔚来 ES8 专属升级方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          17 项热门轻改产品目录，覆盖新车保护、外观个性、家庭座舱、行车与日常防护 4
          大用车场景；蓝辉轻改顺德大良店到店评估、按标准流程施工。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalScenarios} 大用车场景
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalBundles} 个推荐组合
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-sky-950/40 border border-sky-800/60 text-sky-300">
            sky 主题色
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.key}
              href={`${canonicalPath}#scenario-${s.key}`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-sky-700/60 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}