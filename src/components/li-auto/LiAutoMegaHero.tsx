import Link from "next/link";
import { ChevronRight, MessageCircle, ChevronDown } from "lucide-react";

export type LiAutoMegaHeroProps = {
  totalProjects: number;
  totalScenarios: number;
  totalBundles: number;
  canonicalPath: string;
};

const SCENARIO_ANCHORS: readonly {
  key: string;
  label: string;
}[] = [
  { key: "new_car_protection", label: "新车基础保护" },
  { key: "business_cabin", label: "商务座舱与便利" },
  { key: "appearance", label: "外观个性升级" },
  { key: "driving_protection", label: "行车与底盘防护" },
  { key: "lighting_detail", label: "灯光与细节视觉" },
];

/**
 * 理想 MEGA 二级页 Hero（RSC）
 * plan §C.1：
 *   - 面包屑 → PROJECTS 标签 → 标题 → 副标 → 统计 chip → 5 场景锚点
 *   - 主题色 amber（PRD §0.3）
 *   - 主 CTA：咨询 MEGA 升级方案 → scroll to #consult
 *   - 次 CTA：查看 18 项产品目录 → scroll to #li-auto-mega-projects
 *   - 底部车型适配提示
 */
export function LiAutoMegaHero({
  totalProjects,
  totalScenarios,
  totalBundles,
  canonicalPath,
}: LiAutoMegaHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden border-t border-zinc-900">
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
          <Link
            href="/product/li-auto"
            className="hover:text-white transition-colors"
          >
            理想系列
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">理想 MEGA</span>
        </nav>

        <p className="text-sm tracking-widest text-amber-400 mb-3">
          PROJECTS
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          理想 MEGA 专属升级方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          理想 MEGA 全车轻改方案，覆盖基础保护、商务座舱、外观个性、行车防护与灯光视觉
          5 大场景；蓝辉轻改顺德大良店按标准化流程评估与施工。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 项项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalScenarios} 大场景
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalBundles} 个组合
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-300">
            MEGA 专题
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <a
            href="#consult"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            咨询 MEGA 升级方案
          </a>
          <a
            href={`${canonicalPath}#li-auto-mega-projects`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors"
          >
            <ChevronDown className="w-4 h-4" aria-hidden="true" />
            查看 {totalProjects} 项产品目录
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.key}
              href={`${canonicalPath}#scenario-${s.key}`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-amber-700/60 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-600 border-t border-zinc-800 pt-4">
          以上项目适配理想 MEGA 全系版本；不同年份、批次和配置版本的安装位可能存在差异，具体适配性以到店评估为准。
        </p>
      </div>
    </section>
  );
}
