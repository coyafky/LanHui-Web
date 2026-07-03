"use client";

import { Package, ArrowRight } from "lucide-react";
import { trackClick } from "@/lib/analytics";
import type {
  ZhijieV9Bundle,
  ZhijieV9UpgradeProject,
} from "@/lib/zhijie-v9-products";

type ZhijieV9BundleListProps = {
  bundles: readonly ZhijieV9Bundle[];
  projects: readonly ZhijieV9UpgradeProject[];
  highlightBundleKey: string | null;
  onBundleClick: (bundleKey: string) => void;
};

const BUNDLE_LENGTH = 4;

function assertBundleLength(bundles: readonly ZhijieV9Bundle[]): void {
  if (bundles.length !== BUNDLE_LENGTH) {
    throw new Error(
      `ZhijieV9BundleList expects ${BUNDLE_LENGTH} bundles, got ${bundles.length}`,
    );
  }
}

/**
 * 4 大推荐组合（Client Component）
 * SPEC §8 / §9：3 列 / md:3 / sm:1，每卡：组合名 + 价值 + 项目数 + 项目名 preview
 * 点击 → 触发 bundle_click 埋点 + 滚动到 ProjectGrid + 高亮组合内项目
 */
export function ZhijieV9BundleList({
  bundles,
  projects,
  highlightBundleKey,
  onBundleClick,
}: ZhijieV9BundleListProps) {
  assertBundleLength(bundles);

  const projectNameById = new Map<string, string>(
    projects.map((p) => [p.id, p.name] as const),
  );

  function handleBundleClick(bundle: ZhijieV9Bundle) {
    onBundleClick(bundle.key);
    trackClick("bundle_click", {
      bundleKey: bundle.key,
      projectCount: bundle.projectIds.length,
    });
  }

  return (
    <section
      id="zhijie-v9-bundles"
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby="zhijie-v9-bundles-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            RECOMMENDATION BUNDLES
          </p>
          <h2
            id="zhijie-v9-bundles-heading"
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            4 大推荐组合
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-3xl">
            按用车场景预选项目组合，覆盖新车基础保护、商务座舱、外观个性、屏幕显示
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {bundles.map((b) => {
            const isActive = highlightBundleKey === b.key;
            const previewNames = b.projectIds
              .map((id) => projectNameById.get(id))
              .filter((name): name is string => Boolean(name))
              .slice(0, 4);
            return (
              <button
                key={b.key}
                type="button"
                onClick={() => handleBundleClick(b)}
                aria-pressed={isActive}
                aria-label={`查看 ${b.name} 组合详情`}
                className={`group bg-zinc-900 rounded-2xl border transition-colors p-5 flex flex-col text-left ${
                  isActive
                    ? "border-amber-700/60 bg-amber-950/20"
                    : "border-zinc-800 hover:border-amber-700/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Package
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-amber-400" : "text-zinc-500"
                    }`}
                    aria-hidden
                  />
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-900/60 text-amber-400">
                    {`${b.projectIds.length} 项`}
                  </span>
                </div>
                <h3
                  className={`text-base font-bold mb-2 transition-colors ${
                    isActive
                      ? "text-amber-300"
                      : "text-white group-hover:text-amber-400"
                  }`}
                >
                  {b.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {b.value}
                </p>
                <ul className="space-y-1 text-xs text-zinc-500 mb-4 flex-1">
                  {previewNames.map((name) => (
                    <li key={name} className="line-clamp-1">
                      · {name}
                    </li>
                  ))}
                  {b.projectIds.length > 4 && (
                    <li className="text-zinc-600">
                      等 {b.projectIds.length} 项
                    </li>
                  )}
                </ul>
                <span
                  className={`inline-flex items-center text-sm font-medium transition-colors ${
                    isActive
                      ? "text-amber-300"
                      : "text-amber-400 group-hover:text-amber-300"
                  }`}
                >
                  查看组合详情
                  <ArrowRight className="w-4 h-4 ml-1" aria-hidden />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
