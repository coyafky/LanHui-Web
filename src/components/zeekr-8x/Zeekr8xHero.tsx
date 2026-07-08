import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { Zeekr8xProductImage } from "@/lib/zeekr-8x-products";

export type Zeekr8xHeroProps = {
  readonly totalProjects: number;
  readonly totalScenarios: number;
  readonly canonicalPath: string;
  readonly heroImage: Zeekr8xProductImage;
  readonly breadcrumbItems?: readonly BreadcrumbItem[];
};

const SCENARIO_ANCHORS: readonly {
  key: string;
  label: string;
}[] = [
  { key: "new-car-protection", label: "新车保护" },
  { key: "appearance-upgrade", label: "外观升级" },
  { key: "family-cabin", label: "家庭座舱" },
  { key: "smart-display", label: "智能屏幕" },
  { key: "driving-protection", label: "行车防护" },
];

/**
 * 极氪 8X 二级页 Hero（RSC）
 * ORANGE 主题色；结构对齐 9X 单车型页 Hero。
 */
export function Zeekr8xHero({
  totalProjects,
  totalScenarios,
  canonicalPath,
  heroImage,
  breadcrumbItems,
}: Zeekr8xHeroProps) {
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
          ZEEKR 8X UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          极氪 8X 专属升级方案
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          17 项热门轻改产品，覆盖新车保护、外观个性升级、家庭座舱与舒适、智能屏幕与显示保护、行车与日常防护 5
          大用车场景；蓝辉轻改顺德大良店到店评估、按标准流程施工。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalScenarios} 大用车场景
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.key}
              href={`${canonicalPath}#scenario-${s.key}`}
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
