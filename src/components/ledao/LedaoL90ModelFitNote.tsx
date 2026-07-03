/**
 * 乐道 L90 车型适配说明 (Server Component)
 * PRD §3.2：不同批次、配置和版本的 L90 在安装结构、接口、尺寸和空间上可能存在差异
 * 页面项目作为轻改方向参考，最终以到店确认和施工评估为准
 */
export function LedaoL90ModelFitNote() {
  return (
    <section className="py-10 md:py-12 bg-zinc-950 border-b border-zinc-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-900/40 bg-blue-950/10 p-5 md:p-6">
          <h2 className="text-base font-bold text-white mb-2">
            车型适配说明
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            不同批次、配置和版本的乐道 L90 在安装结构、接口、尺寸和空间上可能存在差异。
            本页面展示的项目作为轻改方向参考，最终适配确认和施工方案以到店评估为准。
          </p>
        </div>
      </div>
    </section>
  );
}
