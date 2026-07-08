import Image from "next/image";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs";
import type { DenzaD9ProductImage } from "@/lib/denza-d9-products";

type DenzaD9TopicHeroProps = {
  totalProjects: number;
  scenarioCount: number;
  heroImage: DenzaD9ProductImage;
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

/**
 * 腾势 D9 单车型轻改页 Hero（Server Component）
 * 复刻极氪 9X 车型页的暗色主视觉、统计 chips 和场景锚点。
 */
export function DenzaD9TopicHero({
  totalProjects,
  scenarioCount,
  heroImage,
  breadcrumbItems,
}: DenzaD9TopicHeroProps) {
  return (
    <section
      className="relative bg-zinc-950 text-white overflow-hidden"
      aria-labelledby="denza-d9-hero-title"
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
        <div className="absolute inset-0 bg-zinc-950/80" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.92)_46%,rgba(9,9,11,0.62)_100%)]" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        {breadcrumbItems && <Breadcrumbs items={breadcrumbItems} className="mb-6" />}

        <p className="text-sm tracking-widest text-orange-400 mb-3">
          DENZA D9 UPGRADE
        </p>
        <h1
          id="denza-d9-hero-title"
          className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
        >
          腾势 D9 专属升级方案
        </h1>
        <p className="text-sm md:text-base text-zinc-300 max-w-2xl leading-relaxed mb-8">
          热门轻改产品目录：围绕新车保护、隔热改色、座舱防护、底盘保护、外观个性和高端 MPV
          出行场景，23 项升级项目供选择；蓝辉轻改顺德大良店到店评估、按标准流程施工。
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-700 text-orange-300">
            {totalProjects} 个升级项目
          </span>
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900/80 border border-zinc-700 text-orange-300">
            {scenarioCount} 大用车场景
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SCENARIO_ANCHORS.map((s) => (
            <a
              key={s.id}
              href={`#scenario-${s.id}`}
              className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-500/70 text-sm transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
