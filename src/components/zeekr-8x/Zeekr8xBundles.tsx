"use client";

import type {
  Zeekr8xBundle,
  Zeekr8xUpgradeProject,
} from "@/lib/zeekr-8x-products";
import { trackClick } from "@/lib/analytics";

export type Zeekr8xBundlesProps = {
  readonly bundles: readonly Zeekr8xBundle[];
  readonly allProjects: readonly Zeekr8xUpgradeProject[];
  readonly modelKey: "8X";
};

/**
 * 极氪 8X 5 个推荐组合（CC）[8X SPECIAL]
 * - grid-cols-1 md:2 lg:4
 * - 卡片 hover 触发 hash 切换
 * - 埋点 zeekr_8x_bundle_click
 */
export function Zeekr8xBundles({
  bundles,
  allProjects,
  modelKey,
}: Zeekr8xBundlesProps) {
  const projectNameById = new Map(allProjects.map((p) => [p.id, p.name]));

  function handleProjectLinkClick(bundle: Zeekr8xBundle) {
    trackClick("zeekr_8x_bundle_click", {
      bundleName: bundle.name,
    });
  }

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">BUNDLES</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            极氪 8X · {bundles.length} 个推荐组合
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景搭配的轻改组合；具体组合以到店评估为准。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((b) => (
            <article
              key={b.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-orange-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-2">{b.name}</h3>
              <p className="text-xs text-orange-300 mb-4">{b.description}</p>

              <p className="text-xs text-zinc-500 mb-2">
                {`含 ${b.projectIds.length} 个项目`}
              </p>
              <ul className="flex flex-wrap items-center gap-1.5 mb-4 flex-1">
                {b.projectIds.map((pid) => {
                  const name = projectNameById.get(pid) ?? pid;
                  return (
                    <li
                      key={pid}
                      className="text-xs px-2 py-1 rounded-md border border-orange-800/60 text-orange-300 bg-orange-950/20"
                    >
                      <a
                        href={`#project-${pid}`}
                        onClick={() => handleProjectLinkClick(b)}
                        className="hover:text-orange-200 transition-colors"
                      >
                        {name}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <p className="text-[11px] text-zinc-600 mt-auto">
                {`model: ${modelKey}`}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
