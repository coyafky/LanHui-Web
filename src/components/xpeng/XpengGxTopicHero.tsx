import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";

type XpengGxTopicHeroProps = {
  title: string;
  subtitle: string;
  totalProjects: number;
  scenarioCount: number;
  bundleCount: number;
  preorderCount: number;
};

/**
 * 小鹏 GX 单车型轻改页 Hero（Server Component）
 * SPEC §4：面包屑 / 标题 / 副标 / 简介 / 统计 chips（emerald 主题）
 * 设计要点：
 * - 无 CTA 按钮（与 Tesla 一致，待业务方提供咨询入口后再加）
 * - 装饰光斑 + 渐变背景，dark 主题
 * - 移动端 / 平板 / 桌面三视口正常
 */
export function XpengGxTopicHero({
  title,
  subtitle,
  totalProjects,
  scenarioCount,
  bundleCount,
  preorderCount,
}: XpengGxTopicHeroProps) {
  return (
    <section
      className="relative bg-zinc-950 text-white overflow-hidden"
      aria-labelledby="xpeng-gx-hero-title"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 w-72 h-72 rounded-full bg-emerald-900/20 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        <nav className="flex items-center text-sm text-zinc-500 mb-6" aria-label="面包屑">
          <Link href="/" className="hover:text-white transition-colors">
            首页
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" aria-hidden />
          <Link href="/product" className="hover:text-white transition-colors">
            产品中心
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" aria-hidden />
          <span className="text-zinc-300">小鹏 / GX</span>
        </nav>

        <p className="text-sm tracking-widest text-emerald-400 mb-3 inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden />
          XPENG GX UPGRADE
        </p>
        <h1
          id="xpeng-gx-hero-title"
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
        >
          {title}
        </h1>
        <p className="text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed mb-3">
          {subtitle}
        </p>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-6">
          蓝辉轻改针对小鹏 GX 提供从新车保护到屏幕与座舱维护的完整轻改方向，涵盖新车保护、外观个性、电动便利、底盘与行车防护、屏幕与显示保护、座舱维护六大场景。所有项目以方向参考为主，最终以到店确认和实际施工评估为准。
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            {scenarioCount} 大用车场景
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-emerald-400">
            {bundleCount} 大推荐组合
          </span>
          {preorderCount > 0 && (
            <span className="text-sm px-3 py-1.5 rounded-md bg-amber-950/40 border border-amber-900/60 text-amber-400">
              含 {preorderCount} 项预售
            </span>
          )}
        </div>
      </div>
    </section>
  );
}