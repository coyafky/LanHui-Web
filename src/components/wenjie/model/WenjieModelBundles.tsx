import { Badge } from "@/components/ui/badge";

type BundleLike = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

type ProjectLike = {
  id: string;
  name: string;
};

export type WenjieModelBundlesProps<
  TBundle extends BundleLike,
  TProject extends ProjectLike
> = {
  bundles: readonly TBundle[];
  allProjects: readonly TProject[];
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
};

const PREVIEW_COUNT = 5;

/**
 * 二级页套餐组合 — M6 / M7 / M8 共用
 * 2 列 / sm:1；每卡：套餐名 H3 + 描述 + 项目数 Badge + 前 5 项目名 chips
 */
export function WenjieModelBundles<
  TBundle extends BundleLike,
  TProject extends ProjectLike
>({
  bundles,
  allProjects,
  modelKey,
  modelName,
}: WenjieModelBundlesProps<TBundle, TProject>) {
  const projectNameById = new Map<string, string>(
    allProjects.map((p) => [p.id, p.name] as const),
  );

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby={`wenjie-${modelKey.toLowerCase()}-bundles-heading`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            BUNDLES
          </p>
          <h2
            id={`wenjie-${modelKey.toLowerCase()}-bundles-heading`}
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            {`${modelName} · 套餐组合`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            {`${bundles.length} 个推荐组合，可按车型配置进一步确认`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {bundles.map((b) => {
            const previewNames = b.projectIds
              .map((id) => projectNameById.get(id))
              .filter((name): name is string => typeof name === "string")
              .slice(0, PREVIEW_COUNT);
            return (
              <article
                key={b.key}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {b.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {b.description}
                </p>
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30 self-start mb-3"
                >
                  {`共 ${b.projectIds.length} 个项目`}
                </Badge>
                <ul className="flex flex-wrap gap-2 mb-5 flex-1">
                  {previewNames.map((name) => (
                    <li
                      key={name}
                      className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300"
                    >
                      · {name}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-zinc-500">
                  {`${modelKey} 组合参考 · 按年款和配置确认适配`}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
