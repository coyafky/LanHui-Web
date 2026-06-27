import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SCENARIO_ANCHORS = [
  { key: "protection", label: "新车基础保护" },
  { key: "cabin_atmosphere", label: "座舱氛围与舒适" },
  { key: "appearance", label: "外观个性升级" },
  { key: "smart_screen", label: "智能屏幕" },
  { key: "driving_protection", label: "行车与日常防护" },
] as const;

type LiAutoI6HeroProps = {
  totalProjects: number;
  totalScenarios: number;
  totalBundles: number;
};

export function LiAutoI6Hero({
  totalProjects,
  totalScenarios,
  totalBundles,
}: LiAutoI6HeroProps) {
  return (
    <section className="relative py-16 md:py-20 bg-black overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/10 via-zinc-950 to-black pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 面包屑 */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/product" className="hover:text-zinc-300 transition-colors">
            产品中心
          </Link>
          <span aria-hidden>/</span>
          <Link href="/product/li-auto" className="hover:text-zinc-300 transition-colors">
            理想
          </Link>
          <span aria-hidden>/</span>
          <span className="text-zinc-300">理想 i6</span>
        </nav>

        {/* 主标题 */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          理想 i6 专属升级方案
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-2xl mb-6 leading-relaxed">
          围绕新车保护、玻璃隔热、外观个性、座舱氛围、智能显示、底盘防护和内饰养护，
          为理想 i6 车主提供系统化轻改项目参考。
        </p>

        {/* 统计标签 */}
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-amber-950/30 border border-amber-700/40 text-amber-400 text-xs font-medium">
            {totalProjects} 项热门项目
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            {totalScenarios} 大用车场景
          </span>
          <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium">
            {totalBundles} 个推荐组合
          </span>
        </div>

        {/* 场景锚点导航 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.key}
              href={`#scenario-${s.key}`}
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-white hover:border-amber-700/60 text-xs transition-colors"
            >
              {s.label}
              <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
