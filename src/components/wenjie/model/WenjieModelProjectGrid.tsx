import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type WenjieModelImageStatus = "real" | "generated-preview" | "missing";

type WenjieModelImage = {
  publicPath: string | null;
  alt: string;
  width: 1448;
  height: 1086;
  aspectRatio: "4/3";
};

type ProjectLike = {
  id: string;
  name: string;
  category: string;
  summary: string;
  imageStatus: WenjieModelImageStatus;
  image: WenjieModelImage;
  /** M7/M8 必有；M6 无此字段 */
  tier?: string;
};

export type WenjieModelProjectGridProps<
  TProject extends ProjectLike
> = {
  projects: readonly TProject[];
  modelKey: "M6" | "M7" | "M8";
  titlePrefix: string;
  /** 若提供，按 tier 分组（仅 M7/M8 必传） */
  tierLabel?: string;
};

type ProjectCardProps<TProject extends ProjectLike> = {
  project: TProject;
  modelKey: "M6" | "M7" | "M8";
  titlePrefix: string;
};

function WenjieModelProjectCard<TProject extends ProjectLike>({
  project,
  modelKey,
  titlePrefix,
}: ProjectCardProps<TProject>) {
  const hasTier = typeof project.tier === "string" && project.tier.length > 0;

  return (
    <article className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mb-4">
        {project.image.publicPath ? (
          <Image
            src={project.image.publicPath}
            alt={project.image.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            loading="lazy"
          />
        ) : (
          <div
            role="img"
            aria-label={`${project.name} 功能预览`}
            className="absolute inset-0 bg-gradient-to-br from-cyan-950/30 via-zinc-950 to-zinc-900"
          />
        )}
      </div>

      <h3 className="text-base md:text-lg font-bold text-white mb-1.5">
        {`${titlePrefix} ${project.name}`}
      </h3>
      <p className="text-xs text-zinc-400 leading-relaxed mb-3 flex-1">
        {project.summary}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30"
        >
          {project.category}
        </Badge>
        {hasTier ? (
          <Badge
            variant="outline"
            className="border-cyan-700/40 text-cyan-300 bg-cyan-950/20"
          >
            {project.tier}
          </Badge>
        ) : null}
      </div>

      <p className="text-[11px] text-zinc-500 mt-auto">
        {`${modelKey} 功能预览 · 按车型配置确认适配`}
      </p>
    </article>
  );
}

/**
 * 二级页项目网格 — M6 / M7 / M8 共用
 * 3 列 / md:2 / sm:1
 * 内部子组件 WenjieModelProjectCard 不 export
 */
export function WenjieModelProjectGrid<TProject extends ProjectLike>({
  projects,
  modelKey,
  titlePrefix,
  tierLabel,
}: WenjieModelProjectGridProps<TProject>) {
  // 简单分组：有 tier 的按 tier 聚合，没 tier 的不分组
  const grouped = new Map<string, TProject[]>();
  for (const p of projects) {
    const key =
      typeof p.tier === "string" && p.tier.length > 0 ? p.tier : "__all__";
    const list = grouped.get(key);
    if (list) {
      list.push(p);
    } else {
      grouped.set(key, [p]);
    }
  }

  const groups: readonly { tier: string; items: readonly TProject[] }[] = (() => {
    if (grouped.size === 1 && grouped.has("__all__")) {
      return [{ tier: "__all__", items: projects }];
    }
    return Array.from(grouped.entries()).map(([tier, items]) => ({
      tier,
      items,
    }));
  })();

  // 派生唯一 id：M6 单层级 → "all"；M7/M8 三 tier → "must_have" / "business_upgrade" / "practical_accessory"
  const tierKey =
    typeof projects[0]?.tier === "string" && projects[0].tier.length > 0
      ? projects[0].tier
      : "all";
  const headingId = `wenjie-${modelKey.toLowerCase()}-projects-${tierKey}-heading`;

  return (
    <section
      className="py-16 md:py-20 bg-zinc-950 border-t border-zinc-900"
      aria-labelledby={headingId}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            PROJECTS
          </p>
          <h2
            id={headingId}
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            {`${titlePrefix} · ${projects.length} 个项目`}
          </h2>
          {tierLabel ? (
            <p className="text-zinc-400 text-sm md:text-base">{tierLabel}</p>
          ) : null}
        </div>

        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.tier}>
              {g.tier !== "__all__" ? (
                <h3 className="text-lg md:text-xl font-bold text-white mb-4">
                  {g.tier}
                </h3>
              ) : null}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {g.items.map((p) => (
                  <WenjieModelProjectCard
                    key={p.id}
                    project={p}
                    modelKey={modelKey}
                    titlePrefix={titlePrefix}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
