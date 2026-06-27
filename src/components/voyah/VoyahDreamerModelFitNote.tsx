import { AlertTriangle } from "lucide-react";

/**
 * 车型适配边界说明（Server Component）
 * PRD §3.2 原文一字不改抄写
 * 视觉：violet 边框 + 三角警告 icon，与既有「P1 服务折叠区」风格一致
 */
export function VoyahDreamerModelFitNote() {
  return (
    <section
      className="py-8 md:py-10 bg-zinc-950 border-y border-zinc-900"
      aria-labelledby="voyah-dreamer-fit-note-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          role="note"
          className="flex items-start gap-4 p-5 md:p-6 rounded-2xl bg-violet-950/20 border border-violet-900/50"
        >
          <AlertTriangle
            className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5"
            aria-hidden
          />
          <div className="flex-1">
            <h3
              id="voyah-dreamer-fit-note-heading"
              className="text-sm md:text-base font-bold text-violet-400 mb-2"
            >
              车型适配边界说明
            </h3>
            <p className="text-sm text-violet-100/90 leading-relaxed mb-2">
              不同年份、批次、版本和配置的岚图梦想家在尺寸、接口、安装位和结构上可能存在差异。页面项目只作为轻改方向参考，最终以到店确认和施工评估为准。
            </p>
            <p className="text-xs text-violet-200/70 leading-relaxed">
              如需确认适配请到店沟通具体车型年款与原车状态。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
