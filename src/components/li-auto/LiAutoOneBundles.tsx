"use client";

import type { LiAutoOneBundle, LiAutoOneUpgradeProject } from "@/lib/li-auto-one-products";
import { trackClick } from "@/lib/analytics";

export type LiAutoOneBundlesProps = {
  bundles: readonly LiAutoOneBundle[];
  allProjects: readonly LiAutoOneUpgradeProject[];
  modelKey: "ONE";
};

export function LiAutoOneBundles({ bundles, allProjects, modelKey }: LiAutoOneBundlesProps) {
  const projectNameByKey = new Map(allProjects.map((p) => [p.key, p.name]));

  function handleProjectLinkClick(bundle: LiAutoOneBundle) {
    trackClick("li_auto_one_bundle_click", { bundleName: bundle.name });
  }

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">BUNDLES</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{`理想 ONE · ${bundles.length} 个推荐组合`}</h2>
          <p className="text-zinc-400 text-sm md:text-base">按用车场景搭配的轻改组合；具体组合以到店评估为准。</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((b) => (
            <article key={b.key} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-amber-700/60 transition-colors">
              <h3 className="text-lg font-bold text-white mb-2">{b.name}</h3>
              <p className="text-xs text-amber-300 mb-4">{b.description}</p>
              <p className="text-xs text-zinc-500 mb-2">{`含 ${b.projectKeys.length} 个项目`}</p>
              <ul className="flex flex-wrap items-center gap-1.5 mb-4 flex-1">
                {b.projectKeys.map((pk) => {
                  const name = projectNameByKey.get(pk) ?? pk;
                  return (
                    <li key={pk} className="text-xs px-2 py-1 rounded-md border border-amber-800/60 text-amber-300 bg-amber-950/20">
                      <a href={`#project-${pk}`} onClick={() => handleProjectLinkClick(b)} className="hover:text-amber-200 transition-colors">
                        {name}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[11px] text-zinc-600 mt-auto">{`model: ${modelKey}`}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
