/**
 * PRD §7.5 — "典型用车场景"模块
 *
 * 用于详情页和总页复用。
 * 注意：按 PRD §4.2 / §7.5 严格要求，统一用"典型用车场景"标题，
 * 不冒充真实客户案例。
 */

type Scenario = {
  title: string;
  description: string;
};

type Props = {
  scenarios: Scenario[];
  title?: string;
  eyebrow?: string;
};

export function WindowFilmScenarioGrid({
  scenarios,
  title = "典型用车场景",
  eyebrow = "场景案例",
}: Props) {
  return (
    <section className="py-12 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || eyebrow) && (
          <div className="mb-8">
            {eyebrow && (
              <p className="text-xs tracking-widest mb-3 text-orange-400 uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {title}
              </h2>
            )}
            <p className="mt-2 text-sm text-zinc-500">
              以下为典型用车场景示例，不涉及真实客户案例。
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {scenarios.map((s) => (
            <div
              key={s.title}
              className="rounded-xl bg-zinc-900/60 border border-white/5 p-5 sm:p-6 hover:border-orange-500/30 transition-colors"
            >
              <p className="text-base font-semibold text-white">{s.title}</p>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
