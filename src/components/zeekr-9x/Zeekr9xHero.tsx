import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Zeekr9xHeroProps = {
  totalProjects: number;
  scenarioCount: number;
};

const SCENARIO_ANCHORS: readonly {
  id: string;
  label: string;
}[] = [
  { id: "new-car-protection", label: "新车保护" },
  { id: "appearance-style", label: "外观个性" },
  { id: "cabin-care", label: "座舱防护" },
  { id: "chassis-driving", label: "底盘与行车防护" },
  { id: "premium-quality", label: "高端质感" },
];

/**
 * 极氪 9X 二级页 Hero（RSC）
 * Plan §C.1：
 *   - 面包屑 → 标题 → 副标 → 统计 chip → 5 场景锚点
 *   - 主题色 orange（极氪品牌色）
 *   - 无 CTA 按钮，无 bundles chip（9X 无 bundles）
 */
export function Zeekr9xHero({
  totalProjects,
  scenarioCount,
}: Zeekr9xHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-orange-700/20 blur-3xl" />
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
            href="/product/zeekr"
            className="hover:text-white transition-colors"
          >
            极氪系列
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">极氪 9X</span>
        </nav>

        <p className="text-sm tracking-widest text-orange-400 mb-3">
          ZEEKR 9X UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          极氪 9X 专属升级方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          热门轻改产品目录：围绕新车保护、隔热改色、座舱防护、底盘保护、外观个性和高端
          SUV 出行场景，18 项升级项目供选择；蓝辉轻改顺德大良店到店评估、按标准流程施工。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {scenarioCount} 大用车场景
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.id}
              href={`#scenario-${s.id}`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
