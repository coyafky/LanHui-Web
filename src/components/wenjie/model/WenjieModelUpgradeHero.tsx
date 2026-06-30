import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getWenjieModelHeroImage } from "@/lib/wenjie-preview-images";

export type WenjieModelUpgradeHeroProps = {
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
  title: string;
  subtitle: string;
  tagline: string;
  totalProjects: number;
  canonicalPath: string;
};

function splitTagline(tagline: string): string[] {
  return tagline
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * 二级页 Hero — M6 / M7 / M8 共用
 * PRD §6：标题 / 副标 / tagline chips / 面包屑 / 车型预览图
 * 主题色：cyan（与 WenjieSeriesHero / WenjieTopicBanner 一致）
 *
 * 注意：此组件渲染 H1（页内唯一 H1），内部子组件不要再使用 H1
 */
export function WenjieModelUpgradeHero({
  modelKey,
  modelName,
  title,
  subtitle,
  tagline,
  totalProjects,
  canonicalPath,
}: WenjieModelUpgradeHeroProps) {
  const tags = splitTagline(tagline);
  const heroImage = getWenjieModelHeroImage(modelKey);

  return (
    <section
      className="relative bg-zinc-950 text-white overflow-hidden"
      aria-labelledby={`wenjie-${modelKey.toLowerCase()}-hero-title`}
    >
      <div className="absolute inset-0 -z-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-cyan-700/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 md:pt-24 md:pb-16">
        <nav className="flex items-center text-sm text-zinc-500 mb-6" aria-label="面包屑">
          <Link
            href="/product"
            className="hover:text-white transition-colors"
          >
            产品中心
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" aria-hidden />
          <Link
            href="/product/wenjie"
            className="hover:text-white transition-colors"
          >
            问界
          </Link>
          <ChevronRight className="w-4 h-4 mx-2" aria-hidden />
          <span className="text-zinc-300">{modelName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-sm tracking-widest text-cyan-400 mb-3">
              {modelName.toUpperCase()} UPGRADE
            </p>
            <h1
              id={`wenjie-${modelKey.toLowerCase()}-hero-title`}
              className="text-3xl md:text-5xl font-bold mb-4 leading-tight"
            >
              {title}
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-xl leading-relaxed mb-6">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                {totalProjects} 个升级项目
              </span>
              <span className="text-sm px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                {modelName}
              </span>
            </div>

            {tags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-700/40 text-cyan-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/product/wenjie"
                className="inline-flex items-center px-4 py-2.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-white hover:border-cyan-700/60 text-sm transition-colors"
              >
                返回问界系列
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
              <Image
                src={heroImage.publicPath ?? "/images/products/wenjie/preview.png"}
                alt={heroImage.alt}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-zinc-950/35 via-transparent to-transparent"
                aria-hidden
              />
            </div>
            <p className="text-xs text-zinc-500 mt-3 text-center">
              功能预览图用于说明升级方向，不代表实车案例 · {canonicalPath}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
