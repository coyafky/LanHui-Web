/**
 * LightModMap — 轻改装业务地图（orange 主题）
 *
 * PRD v3 §4.3.2。视觉差异化（与 FilmServiceMap 完全不同）：
 * - 背景: repeating-linear-gradient 模拟金属拉丝纹理
 * - 卡片: 厚边框 border-2 + 内阴影 + 4 角螺丝孔点装饰
 * - Hover: 边框颜色由 orange-700/40 → orange-500 + 金属反光扫过
 * - 2 列大卡片（少而精，强调金属装备感）
 * - P0 live light_mod 服务 (electric-steps / wheels / chassis)
 *
 * RSC — 纯展示
 */

import Link from "next/link";
import { Wrench, CircleDot, Settings2 } from "lucide-react";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = {
  services: readonly ServiceRoute[];
};

const ICON_MAP: Record<string, typeof Wrench> = {
  "electric-steps": Wrench,
  wheels: CircleDot,
  chassis: Settings2,
};

const TAGLINE_MAP: Record<string, string> = {
  "electric-steps": "开门自动展开 · 收起贴合原车 · 无损安装不破线束",
  wheels: "数据精准匹配 · 款式多样可选 · 兼顾视觉与行驶品质",
  chassis: "避震与加强件轻度升级 · 日常驾驶更舒适有质感",
};

const CORNER_DOT = "absolute w-1 h-1 rounded-full bg-orange-700/40";

export function LightModMap({ services }: Props) {
  return (
    <section
      aria-labelledby="lightmod-map-title"
      className="relative overflow-hidden rounded-3xl border-2 border-orange-900/40 bg-zinc-950"
    >
      {/* 背景: 金属拉丝纹理 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(251, 146, 60, 0.03) 0 1px, transparent 1px 12px)",
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs tracking-widest text-orange-400 mb-2">
            LIGHT MOD · 轻改装
          </p>
          <h2
            id="lightmod-map-title"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            围绕姿态与上下车的金属升级
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            不破线束 · 不伤原车结构 · 视觉与功能双重提升
          </p>
        </div>

        {/* 2 列大卡片 (3 个服务: 2 + 1, 最后一张跨满) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {services.map((service) => {
            const Icon = ICON_MAP[service.serviceSlug] ?? Wrench;
            const tagline = TAGLINE_MAP[service.serviceSlug] ?? "";
            const isLastSingle =
              services.length % 2 === 1 &&
              service === services[services.length - 1];

            return (
              <Link
                key={service.serviceSlug}
                href={service.canonicalPath}
                className={`group relative block rounded-2xl border-2 border-orange-700/40 bg-zinc-900/60 p-5 md:p-6 transition-all duration-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 overflow-hidden ${
                  isLastSingle ? "md:col-span-2" : ""
                }`}
                style={{
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
              >
                {/* 4 角螺丝孔点 */}
                <span
                  className={`${CORNER_DOT} top-2 left-2 group-hover:bg-orange-500/70 transition-colors`}
                  aria-hidden="true"
                />
                <span
                  className={`${CORNER_DOT} top-2 right-2 group-hover:bg-orange-500/70 transition-colors`}
                  aria-hidden="true"
                />
                <span
                  className={`${CORNER_DOT} bottom-2 left-2 group-hover:bg-orange-500/70 transition-colors`}
                  aria-hidden="true"
                />
                <span
                  className={`${CORNER_DOT} bottom-2 right-2 group-hover:bg-orange-500/70 transition-colors`}
                  aria-hidden="true"
                />

                {/* Hover 金属反光扫过 */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(110deg, transparent 30%, rgba(251, 146, 60, 0.15) 50%, transparent 70%)",
                  }}
                />

                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-orange-950/60 border-2 border-orange-700/60 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-900/60 transition-colors">
                    <Icon
                      className="w-6 h-6 md:w-7 md:h-7 text-orange-300 group-hover:text-orange-200"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-orange-200 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[10px] tracking-wider text-orange-500/70 mt-0.5 mb-2">
                      {service.navLabel.toUpperCase()}
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {tagline}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
