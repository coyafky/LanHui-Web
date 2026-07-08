import { Sparkles } from "lucide-react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";

type ZhijieBrandHeroProps = {
  totalModels: number;
  totalProjects: number;
  breadcrumbItems?: readonly BreadcrumbItem[];
};

/**
 * 智界品牌页 Hero（Server Component）
 * Amber 主题，品牌页信息展示
 * - 面包屑：首页 → 产品中心 → 智界
 * - 装饰光斑 + 渐变背景
 * - 无 CTA 按钮（品牌页为信息展示页）
 */
export function ZhijieBrandHero({
  totalModels,
  totalProjects,
  breadcrumbItems,
}: ZhijieBrandHeroProps) {
  return (
    <section
      className="relative bg-zinc-950 text-white overflow-hidden"
      aria-labelledby="zhijie-brand-hero-title"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-amber-700/20 blur-3xl" />
        <div className="absolute -bottom-24 left-0 w-72 h-72 rounded-full bg-amber-900/20 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-6" />}

        <p className="text-sm tracking-widest text-amber-400 mb-3 inline-flex items-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden />
          ZHIJIE UPGRADE
        </p>
        <h1
          id="zhijie-brand-hero-title"
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
        >
          智界轻改方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-3">
          蓝辉轻改整理智界热门车型的轻改与膜系方案
        </p>
        <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed mb-6">
          蓝辉轻改为智界 V9 提供从新车保护到座舱与底盘防护的完整轻改方向参考，覆盖车衣、隔热膜、彩绘、
          改色膜、360 软包脚垫、平衡杆、底盘护板、铝地板、门槛条、牌照框、挡泥板、防虫网、钢化膜和抬头显示罩
          共 14 个项目。所有项目以方向参考为主，最终以到店确认和实际施工评估为准。
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm px-3 py-1.5 rounded-md bg-amber-950/40 border border-amber-900/60 text-amber-400">
            {totalModels} 款车型
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-amber-950/40 border border-amber-900/60 text-amber-400">
            {totalProjects} 个升级项目
          </span>
        </div>
      </div>
    </section>
  );
}
