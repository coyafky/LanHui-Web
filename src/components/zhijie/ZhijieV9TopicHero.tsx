import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { ZhijieV9ProductImage } from "@/lib/zhijie-v9-products";

type ZhijieV9TopicHeroProps = {
  totalProjects: number;
  scenarioCount: number;
  heroImage: ZhijieV9ProductImage;
  breadcrumbItems?: readonly BreadcrumbItem[];
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

export function ZhijieV9TopicHero({
  totalProjects,
  scenarioCount,
  heroImage,
  breadcrumbItems,
}: ZhijieV9TopicHeroProps) {
  return (
    <section className="relative bg-zinc-950 text-white overflow-hidden">
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
        <div className="absolute inset-0 bg-zinc-950/80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.88)_42%,rgba(9,9,11,0.58)_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        )}

        <p className="text-sm tracking-widest text-orange-400 mb-3">
          ZHIJIE V9 UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          智界 V9 专属升级方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          热门轻改产品目录：围绕新车保护、隔热改色、座舱防护、底盘保护、屏幕显示和商务
          MPV 出行场景，14 项升级项目供选择；蓝辉轻改顺德大良店到店评估、按标准流程施工。
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
