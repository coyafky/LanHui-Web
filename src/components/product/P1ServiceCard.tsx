/**
 * P1ServiceCard — 单个 P1 服务卡片 (用于 P1 折叠区)
 *
 * 设计：amber 主题（沿用 wenjie/flooring 的 amber 主题色），与 P0 三大地图的 cyan/orange/violet 区分
 * - 边框: border-zinc-800, hover border-amber-700/60
 * - 状态徽章: planned 时显示"整理中" 标签
 * - 简洁网格布局: 左 icon + 右标题/tagline
 */

import Link from "next/link";
import { Sparkles, Briefcase, ShieldCheck } from "lucide-react";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = {
  service: ServiceRoute;
};

const ICON_MAP: Record<string, typeof Sparkles> = {
  flooring: Sparkles,
  "floor-mats": Sparkles,
  "business-comfort": Briefcase,
  "skid-plate": ShieldCheck,
};

const TAGLINE_MAP: Record<string, string> = {
  flooring: "原车数据精准开模 · 不卡座椅滑轨",
  "floor-mats": "360° 全包覆 · 易清洁 · 不影响气囊弹出",
  "business-comfort": "座椅通风/加热/按摩 · 接待场景升级",
  "skid-plate": "原车数据开模 · 不破线束 · 不影响离地间隙",
};

export function P1ServiceCard({ service }: Props) {
  const Icon = ICON_MAP[service.serviceSlug] ?? Sparkles;
  const tagline = TAGLINE_MAP[service.serviceSlug] ?? "";
  const isPlanned = service.status === "planned";

  return (
    <Link
      href={service.canonicalPath}
      className="group relative block rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-amber-700/60 hover:bg-zinc-900"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-center group-hover:border-amber-600/60 transition-colors">
          <Icon className="w-5 h-5 text-amber-400" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-base font-bold text-white group-hover:text-amber-200 transition-colors">
              {service.title}
            </h4>
            {isPlanned && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] tracking-wider bg-amber-950/40 border border-amber-800/40 text-amber-400">
                整理中
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 tracking-wider mb-1">
            {service.navLabel.toUpperCase()}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">{tagline}</p>
        </div>
      </div>
    </Link>
  );
}
