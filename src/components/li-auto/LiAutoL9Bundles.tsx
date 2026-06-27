import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type {
  LiAutoL9Bundle,
  LiAutoL9UpgradeProject,
} from "@/lib/li-auto-l9-products";

export type LiAutoL9BundlesProps = {
  bundles: readonly LiAutoL9Bundle[];
  allProjects: readonly LiAutoL9UpgradeProject[];
  modelKey: string;
};

/**
 * 理想 L9 4 个推荐组合（RSC）
 * plan §C.3：
 *   - 4 张组合卡片（grid-cols-1 md:2 lg:4）
 *   - amber 主题色
 *   - 每张卡片底部「咨询此组合」CTA（Link → #consult + bundle key）
 *   - 项目标签纯展示，不可点击（RSC 无 hash 联动）
 */
export function LiAutoL9Bundles({
  bundles,
  allProjects,
  modelKey,
}: LiAutoL9BundlesProps) {
  const projectNameByKey = new Map(allProjects.map((p) => [p.key, p.name]));

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-amber-400 mb-3">BUNDLES</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {`理想 L9 · ${bundles.length} 个推荐组合`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            按用车场景搭配的轻改组合；具体组合以到店评估为准。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((b) => (
            <article
              key={b.key}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col hover:border-amber-700/60 transition-colors"
            >
              <h3 className="text-lg font-bold text-white mb-2">{b.name}</h3>
              <p className="text-xs text-amber-300 mb-4">{b.description}</p>

              <p className="text-xs text-zinc-500 mb-2">
                {`含 ${b.projectKeys.length} 个项目`}
              </p>
              <ul className="flex flex-wrap items-center gap-1.5 mb-4 flex-1">
                {b.projectKeys.map((pk) => {
                  const name = projectNameByKey.get(pk) ?? pk;
                  return (
                    <li
                      key={pk}
                      className="text-xs px-2 py-1 rounded-md border border-amber-800/60 text-amber-300 bg-amber-950/20"
                    >
                      {name}
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`#consult&bundle=${b.key}`}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors mt-auto"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                咨询此组合
              </Link>
            </article>
          ))}
        </div>

        {/* 隐藏 modelKey 用途说明：避免 TS unused warning，又保留可观测扩展位 */}
        <span className="sr-only">{`model: ${modelKey}`}</span>
      </div>
    </section>
  );
}
