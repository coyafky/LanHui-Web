import { Badge } from "@/components/ui/badge";

type ScenarioLike = {
  key: string;
  name: string;
  description: string;
  projectIds: readonly string[];
};

type ProjectLike = {
  id: string;
  name: string;
};

export type WenjieModelScenariosProps<
  TScenario extends ScenarioLike,
  TProject extends ProjectLike
> = {
  scenarios: readonly TScenario[];
  allProjects: readonly TProject[];
  modelKey: "M6" | "M7" | "M8";
  modelName: string;
};

const PREVIEW_COUNT = 3;

/**
 * 二级页场景列表 — M6 / M7 / M8 共用
 * 2 列 / sm:1；每卡：H3 场景名 + 描述 + 项目数 Badge + 前 3 项目名 chips
 */
export function WenjieModelScenarios<
  TScenario extends ScenarioLike,
  TProject extends ProjectLike
>({
  scenarios,
  allProjects,
  modelKey,
  modelName,
}: WenjieModelScenariosProps<TScenario, TProject>) {
  const projectNameById = new Map<string, string>(
    allProjects.map((p) => [p.id, p.name] as const),
  );

  const sectionId = `scenarios-${modelKey.toLowerCase()}`;

  return (
    <section
      id={sectionId}
      className="py-16 md:py-20 bg-black border-y border-zinc-900 scroll-mt-20"
      aria-labelledby={`${sectionId}-heading`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <p className="text-sm tracking-widest text-cyan-400 mb-3">
            SCENARIOS
          </p>
          <h2
            id={`${sectionId}-heading`}
            className="text-2xl md:text-3xl font-bold text-white mb-2"
          >
            {`${modelName} · ${scenarios.length} 大场景`}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base">
            {`${scenarios.length} 大用车场景，对应不同项目组合`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {scenarios.map((s) => {
            const previewNames = s.projectIds
              .map((id) => projectNameById.get(id))
              .filter((name): name is string => typeof name === "string")
              .slice(0, PREVIEW_COUNT);
            return (
              <article
                key={s.key}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col"
              >
                <h3 className="text-lg font-bold text-white mb-2">
                  {s.name}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {s.description}
                </p>
                <Badge
                  variant="outline"
                  className="border-cyan-700/60 text-cyan-400 bg-cyan-950/30 self-start mb-3"
                >
                  {`共 ${s.projectIds.length} 个项目`}
                </Badge>
                <ul className="flex flex-wrap gap-2">
                  {previewNames.map((name) => (
                    <li
                      key={name}
                      className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-300"
                    >
                      · {name}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
