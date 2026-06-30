/**
 * FilmServiceMap — 车膜业务地图（cyan 主题）
 *
 * PRD v3 §4.3.1。视觉差异化：
 * - 背景: linear-gradient(135deg, cyan-400/10 0%, transparent 60%) + backdrop-blur-md
 * - 卡片: 半透明膜片 (border cyan-800/50, bg cyan-950/20) + 内嵌 4-6 条光透射线
 * - Hover: backdrop-blur-xl + 1.02 scale, 200ms ease-out-expo
 * - 3 列紧凑网格, P0 live film 服务 (ppf / window-film / color-film)
 *
 * RSC — 不需要 useState, 纯展示
 */

import Link from "next/link";
import { Shield, Sun, Palette } from "lucide-react";
import type { ServiceRoute } from "@/lib/product-routes";

type Props = {
  services: readonly ServiceRoute[];
};

const ICON_MAP: Record<string, typeof Shield> = {
  ppf: Shield,
  "window-film": Sun,
  "color-film": Palette,
};

// 从 products.ts 复用的 tagline (避免在 RSC 触发额外数据加载)
const TAGLINE_MAP: Record<string, string> = {
  ppf: "花少钱，贴对膜 · TPU 透明膜防刮自修复",
  "window-film": "前挡清晰+侧后隐私，夏季用车更舒适",
  "color-film": "不伤原漆，撕除即可恢复，色系丰富可选",
};

export function FilmServiceMap({ services }: Props) {
  return (
    <section
      aria-labelledby="film-map-title"
      className="relative overflow-hidden rounded-3xl border border-cyan-900/40 bg-zinc-950"
    >
      {/* 背景: cyan 光透射 + backdrop-blur */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent backdrop-blur-md"
      />

      {/* 光透射线纹理 — 模拟玻璃贴膜后的折射感 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {[
          "top-[15%] left-[5%] right-[20%]",
          "top-[35%] left-[15%] right-[5%]",
          "top-[55%] left-[8%] right-[25%]",
          "top-[75%] left-[12%] right-[10%]",
          "top-[25%] left-[40%] right-[40%]",
          "top-[65%] left-[35%] right-[15%]",
        ].map((pos, i) => (
          <div
            key={i}
            className={`absolute h-px bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent ${pos}`}
          />
        ))}
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Eyebrow + H2 */}
        <div className="mb-6">
          <p className="text-xs tracking-widest text-cyan-400 mb-2">
            FILM SERIES · 车膜系列
          </p>
          <h2
            id="film-map-title"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            漆面与玻璃的全方位膜系
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            漆面保护的隐形盾牌 · 玻璃的隔热卫士 · 改色的视觉表达
          </p>
        </div>

        {/* 3 列紧凑网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {services.map((service) => {
            const Icon = ICON_MAP[service.serviceSlug] ?? Shield;
            const tagline = TAGLINE_MAP[service.serviceSlug] ?? "";
            return (
              <Link
                key={service.serviceSlug}
                href={service.canonicalPath}
                className="group relative block rounded-xl border border-cyan-800/50 bg-cyan-950/20 p-4 md:p-5 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-cyan-400/60 hover:bg-cyan-950/40 hover:backdrop-blur-xl hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {/* 卡片内 2 条额外光透射线 */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                >
                  <div className="absolute top-[30%] left-[10%] right-[20%] h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
                  <div className="absolute top-[70%] left-[20%] right-[10%] h-px bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center group-hover:border-cyan-400/60 transition-colors">
                      <Icon
                        className="w-5 h-5 text-cyan-300"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-[10px] tracking-wider text-cyan-500/70 mt-0.5">
                        {service.navLabel.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {tagline}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
