import Link from "next/link";
import Image from "next/image";
import { getWenjieModelHeroImage } from "@/lib/wenjie-preview-images";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";

export type WenjieModelUpgradeHeroProps = {
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
  title: string;
  subtitle: string;
  tagline: string;
  totalProjects: number;
  scenarioCount?: number;
  scenarioAnchors?: readonly { id: string; label: string }[];
  canonicalPath: string;
  breadcrumbItems?: readonly BreadcrumbItem[];
};

/**
 * 二级页 Hero — M6 / M7 / M8 共用
 * 结构一比一对齐极氪 9X Hero：背景图 + 深色遮罩 + 统计 chip + 场景锚点。
 */
export function WenjieModelUpgradeHero({
  modelKey,
  modelName,
  title,
  subtitle,
  totalProjects,
  scenarioCount,
  scenarioAnchors = [],
  breadcrumbItems,
}: WenjieModelUpgradeHeroProps) {
  const heroImage = getWenjieModelHeroImage(modelKey);

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
          {modelName.toUpperCase()} UPGRADE
        </p>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl leading-relaxed mb-6">
          {subtitle}
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {totalProjects} 个升级项目
          </span>
          {typeof scenarioCount === "number" ? (
            <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              {scenarioCount} 大用车场景
            </span>
          ) : null}
        </div>

        {scenarioAnchors.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {scenarioAnchors.map((s) => (
              <a
                key={s.id}
                href={`#scenario-${s.id}`}
                className="inline-flex items-center px-3 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-orange-700/60 text-sm transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
