"use client";

import type {
  NioEs8Bundle,
  NioEs8UpgradeProject,
} from "@/lib/nio-products";
import { trackClick } from "@/lib/analytics";

export type NioEs8BundlesProps = {
  bundles: readonly NioEs8Bundle[];
  allProjects: readonly NioEs8UpgradeProject[];
  modelKey: "ES8";
};

/**
 * NIO ES8 4 个推荐组合（CC）
 * plan §C.3：
 *   - 4 张组合卡片（grid-cols-1 md:2 lg:4）
 *   - 无 CTA 按钮
 *   - 组合卡片 hover 触发 hash 切换（具体高亮交由 NioEs8ProjectGrid 监听 hashchange）
 *
 * SPEC §E.3b：组合卡片内项目标签 `<a>` 点击触发 hash 联动时
 *   → `nio_es8_bundle_click` 埋点（bundleName 取所属组合名）
 */
export function NioEs8Bundles({
  bundles,
  allProjects,
  modelKey,
}: NioEs8BundlesProps) {
  const projectNameByKey = new Map(allProjects.map((p) => [p.key, p.name]));

  function handleProjectLinkClick(bundle: NioEs8Bundle) {
    trackClick("nio_es8_bundle_click", {
      bundleName: bundle.name,
    });
  }

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-sky-400 mb-3">BUNDLES</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {`蔚来 ES8 · ${bundles.length} 个推荐组合`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景搭配的轻改组合；具体组合以到店评估为准。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((b) => (
            <article
              key={b.key}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-sky-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-2">{b.name}</h3>
              <p className="text-xs text-sky-300 mb-4">{b.description}</p>

              <p className="text-xs text-zinc-500 mb-2">
                {`含 ${b.projectKeys.length} 个项目`}
              </p>
              <ul className="flex flex-wrap items-center gap-1.5 mb-4 flex-1">
                {b.projectKeys.map((pk) => {
                  const name = projectNameByKey.get(pk) ?? pk;
                  return (
                    <li
                      key={pk}
                      className="text-xs px-2 py-1 rounded-md border border-sky-800/60 text-sky-300 bg-sky-950/20"
                    >
                      <a
                        href={`#project-${pk}`}
                        onClick={() => handleProjectLinkClick(b)}
                        className="hover:text-sky-200 transition-colors"
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