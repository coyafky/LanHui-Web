"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { LiAutoI6Bundle, LiAutoI6UpgradeProject } from "@/lib/li-auto-i6-products";

type LiAutoI6BundlesProps = {
  bundles: readonly LiAutoI6Bundle[];
  allProjects: readonly LiAutoI6UpgradeProject[];
  modelKey: string;
};

export function LiAutoI6Bundles({
  bundles,
  allProjects,
  modelKey,
}: LiAutoI6BundlesProps) {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);

  const toggleBundle = (key: string) => {
    setExpandedBundle(expandedBundle === key ? null : key);
  };

  const getProject = (projectKey: string) =>
    allProjects.find((p) => p.key === projectKey);

  return (
    <section className="py-16 md:py-20 bg-black border-y border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">
            RECOMMENDED BUNDLES
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            推荐组合方案
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            根据用车场景和需求，选择合适的项目组合
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {bundles.map((bundle) => {
            const isExpanded = expandedBundle === bundle.key;

            return (
              <div
                key={bundle.key}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden flex flex-col"
              >
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {bundle.description}
                  </p>

                  {/* 组合内项目列表 */}
                  <ul className="space-y-1.5">
                    {bundle.projectKeys.map((pk) => {
                      const proj = getProject(pk);
                      return (
                        <li key={pk} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-amber-950/40 text-amber-400/80 text-[10px] font-bold shrink-0">
                            {proj?.order ?? "-"}
                          </span>
                          <a
                            href={`#${modelKey}-${pk}`}
                            className="text-zinc-300 hover:text-amber-400 transition-colors"
                          >
                            {proj?.name ?? pk}
                          </a>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 展开说明 */}
                  <button
                    type="button"
                    onClick={() => toggleBundle(bundle.key)}
                    className="inline-flex items-center text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors mt-auto self-start"
                  >
                    {isExpanded ? "收起说明" : "了解组合"}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </button>

                  {isExpanded && (
                    <div className="pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                      <p>
                        以上组合为推荐方向，并非强制套餐。具体施工项目和价格以到店评估确认为准。
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
