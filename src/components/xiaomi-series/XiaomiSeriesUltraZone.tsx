import type {
  XiaomiSeriesUltraZoneItem,
  XiaomiSeriesUpgradeProject,
} from "@/lib/xiaomi-series-upgrade-projects";

export type XiaomiSeriesUltraZoneProps = {
  items: readonly XiaomiSeriesUltraZoneItem[];
  allProjects: readonly XiaomiSeriesUpgradeProject[];
};

/**
 * 小米全系列 Ultra 风格专区（RSC）
 * PRD §9：8 项 Ultra 风格项目，展示项目名 + highlight 描述
 */
export function XiaomiSeriesUltraZone({
  items,
  allProjects,
}: XiaomiSeriesUltraZoneProps) {
  const projectNameById = new Map(allProjects.map((p) => [p.id, p.name]));

  return (
    <section className="py-16 md:py-20 bg-black border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-orange-400 mb-3">
            ULTRA ZONE
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ultra 风格专区
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            适合追求运动化、性能化视觉表达的用户。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((u) => {
            const projectName = projectNameById.get(u.projectId) ?? u.projectId;
            return (
              <article
                key={u.projectId}
                className="bg-zinc-900 border border-orange-900/40 rounded-2xl p-5 flex flex-col"
              >
                <span className="text-xs tracking-widest text-orange-400 mb-2">
                  ULTRA
                </span>
                <h3 className="text-lg font-bold text-white mb-1.5">
                  {projectName}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {u.highlight}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
