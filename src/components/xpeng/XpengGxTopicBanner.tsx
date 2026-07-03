import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * 小鹏 GX 单车型专题页 — /product 入口卡片
 * SPEC §4：标题「小鹏 GX 专属升级方案」+ 副标题 + 标签 + 跳转 /product/xpeng/gx
 * 设计对齐极氪 9X 专题入口：橙色主题卡片，live 状态标识。
 */
export function XpengGxTopicBanner() {
  return (
    <Link
      href="/product/xpeng/gx"
      className="group block bg-gradient-to-br from-orange-950/20 via-zinc-900 to-zinc-900 border border-orange-900/40 rounded-2xl p-6 sm:p-8 hover:border-orange-700/60 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-800/60">
              live
            </span>
            <span className="text-xs text-zinc-500">小鹏系列</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            小鹏 GX 专属升级方案
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            覆盖车衣、隔热膜、彩绘、改色膜、电动门、底盘护板、360 脚垫、钢化膜等 15 项升级项目，按 6 大用车场景和 3 大推荐组合分类。
          </p>
        </div>
        <ArrowRight className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
