import { windowFilmParameterExplanations } from "@/lib/window-film-details";

/**
 * PRD §6.2 — "参数怎么选，先看这几个指标"参数解释模块
 *
 * 5 行参数表，覆盖总页和详情页可复用。
 * 注意：当前字段"可见光阻隔率"按 PRD §6.2 注释以"当前资料口径下的可见光指标"解释，
 * 不扩写为行业通用 VLT 透过率。
 */
export function WindowFilmParameterExplainer() {
  return (
    <section className="py-16 bg-zinc-950 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest mb-3 text-orange-400 uppercase">
            参数解读
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            参数怎么选，先看这几个指标
          </h2>
          <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
            把膜参数翻译成用车体验，重点关注这几个核心指标即可。
          </p>
        </div>

        {/* 桌面 / 平板表格 */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="bg-orange-950/40 text-orange-300">
                <th className="px-4 py-3 text-left font-semibold border-b border-zinc-800 w-32">
                  参数
                </th>
                <th className="px-4 py-3 text-left font-semibold border-b border-zinc-800 w-56">
                  全称 / 含义
                </th>
                <th className="px-4 py-3 text-left font-semibold border-b border-zinc-800">
                  用户理解
                </th>
              </tr>
            </thead>
            <tbody>
              {windowFilmParameterExplanations.map((row, i) => (
                <tr
                  key={row.code}
                  className={i % 2 === 0 ? "bg-zinc-900/30" : "bg-zinc-950/30"}
                >
                  <td className="px-4 py-3 border-b border-zinc-800/60 font-mono text-zinc-200 align-top">
                    {row.code}
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-800/60 text-zinc-300 align-top">
                    {row.fullName}
                  </td>
                  <td className="px-4 py-3 border-b border-zinc-800/60 text-zinc-400 leading-relaxed align-top">
                    {row.userMeaning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端信息块（避免表格横向滚动） */}
        <div className="sm:hidden space-y-3">
          {windowFilmParameterExplanations.map((row) => (
            <div
              key={row.code}
              className="rounded-xl border border-white/5 bg-zinc-900/40 p-4"
            >
              <p className="font-mono text-sm font-semibold text-orange-300">
                {row.code}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{row.fullName}</p>
              <p className="mt-2 text-sm text-zinc-300 leading-relaxed">
                {row.userMeaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
