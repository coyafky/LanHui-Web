import Image from "next/image";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
import type { VoyahDreamerProductImage } from "@/lib/voyah-products";

type VoyahDreamerHeroProps = {
  title: string;
  subtitle: string;
  description: string;
  totalProjects: number;
  scenarioCount: number;
  heroImage: VoyahDreamerProductImage;
  breadcrumbItems?: readonly BreadcrumbItem[];
};

const SCENARIO_ANCHORS: readonly {
  id: string;
  label: string;
}[] = [
  { id: "scenario-new-car-protection", label: "新车保护" },
  { id: "scenario-appearance", label: "外观个性" },
  { id: "scenario-chassis-protection", label: "底盘防护" },
  { id: "scenario-mpv-comfort", label: "MPV 舒适" },
  { id: "scenario-cabin-care", label: "座舱维护" },
];

/**
 * 岚图梦想家单车型轻改页 Hero（Server Component）
 * 面包屑 / 标题 / 副标 / 简介 / 统计 chips（violet 主题）
 * 设计要点：
 * - 无 CTA 按钮
 * - 装饰光斑 + 渐变背景，dark 主题
 * - 移动端 / 平板 / 桌面三视口正常
 */
export function VoyahDreamerHero({
  title,
  subtitle,
  description,
  totalProjects,
  scenarioCount,
  heroImage,
  breadcrumbItems,
}: VoyahDreamerHeroProps) {
  return (
    <section
      className="relative bg-zinc-950 text-white overflow-hidden"
      aria-labelledby="voyah-dreamer-hero-title"
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        {heroImage.publicPath ? (
          <Image
            src={heroImage.publicPath}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
        ) : null}
        <div className="absolute inset-0 bg-zinc-950/82" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.88)_42%,rgba(9,9,11,0.58)_100%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-6" />}

        <p className="text-sm tracking-widest text-violet-400 mb-3">
          VOYAH DREAMER UPGRADE
        </p>
        <h1
          id="voyah-dreamer-hero-title"
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
        >
          {title}
        </h1>
        <p className="text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed mb-3">
          {subtitle}
        </p>
        <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed mb-6">
          {description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm px-3 py-1.5 rounded-md bg-violet-950/40 border border-violet-900/60 text-violet-400">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-violet-950/40 border border-violet-900/60 text-violet-400">
            {scenarioCount} 大用车场景
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-8">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-violet-700/60 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
