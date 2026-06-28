import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type XiaomiSu7HeroProps = {
  totalProjects: number;
  totalScenarios: number;
};

export function XiaomiSu7Hero({
  totalProjects,
  totalScenarios,
}: XiaomiSu7HeroProps) {
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
            href="/product/xiaomi"
            className="hover:text-white transition-colors"
          >
            小米系列
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-zinc-300">小米 SU7</span>
        </nav>

        <p className="text-sm tracking-widest text-orange-400 mb-3">
          XIAOMI SU7 UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          小米 SU7 专属轻改方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          12 项热门轻改产品目录：围绕外观运动、内饰质感、驾驶升级和新车保护场景，提供前包围、侧裙、机盖、尾翼、方向盘、中控面板等升级项目参考。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalScenarios} 大用车场景
          </span>
        </div>
      </div>
    </section>
  );
}
