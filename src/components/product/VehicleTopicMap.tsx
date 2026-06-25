"use client";

/**
 * VehicleTopicMap — 车型专题业务地图（violet 主题）
 *
 * PRD v3 §4.3.3。视觉差异化（与 Film/LightMod 完全不同）：
 * - 背景: radial-gradient 模拟紫色辉光
 * - 卡片: 11 品牌色块矩阵 + 3 重点品牌 (wenjie/xiaomi/zeekr) 放大显示
 * - Hover: 色块放大 + 第一人称文案浮现 ("我是 [品牌] 车主")
 * - 视角: 车主第一人称 (与 Film/LightMod 的"项目"视角对照)
 * - 文案: "我是 [品牌] 车主" / 实际车型
 *
 * "use client" 因为需要 useState 管理 hover 状态
 */

import { useState } from "react";
import Link from "next/link";
import type { VehicleBrandRoute, AccentColor } from "@/lib/product-routes";

type Props = {
  brands: readonly VehicleBrandRoute[];
};

// 11 品牌色块的 hover 边框 / 文字 / 背景色
const ACCENT_BG: Record<AccentColor, string> = {
  cyan: "bg-cyan-500",
  orange: "bg-orange-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
  blue: "bg-blue-500",
  teal: "bg-teal-500",
  red: "bg-red-500",
};

const ACCENT_BORDER: Record<AccentColor, string> = {
  cyan: "border-cyan-400",
  orange: "border-orange-400",
  amber: "border-amber-400",
  emerald: "border-emerald-400",
  violet: "border-violet-400",
  pink: "border-pink-400",
  blue: "border-blue-400",
  teal: "border-teal-400",
  red: "border-red-400",
};

const ACCENT_TEXT: Record<AccentColor, string> = {
  cyan: "text-cyan-300",
  orange: "text-orange-300",
  amber: "text-amber-300",
  emerald: "text-emerald-300",
  violet: "text-violet-300",
  pink: "text-pink-300",
  blue: "text-blue-300",
  teal: "text-teal-300",
  red: "text-red-300",
};

// 第一人称视角 — 与 vehicle-topics 区域呼应
const FIRST_PERSON_MAP: Record<string, string> = {
  wenjie: "我开问界 · 看重 M 系列家用体验",
  xiaomi: "我是小米车主 · 看重科技与运动感",
  zeekr: "我是极氪车主 · 看重操控与质感",
  "li-auto": "我是理想车主 · 看重家用舒适",
  tesla: "我是特斯拉车主 · 看重简洁与科技",
  xpeng: "我是小鹏车主 · 看重智驾与年轻化",
  denza: "我是腾势车主 · 看重商务与舒适",
  voyah: "我是岚图车主 · 看重高端与稳重",
  ledao: "我是乐道车主 · 看重家用与空间",
  gaoshan: "我是高山车主 · 看重商务接待",
  zhijie: "我是智界车主 · 看重智驾与设计",
};

// 3 重点品牌 — 放大显示
const FEATURED_SLUGS: readonly string[] = ["wenjie", "xiaomi", "zeekr"];

export function VehicleTopicMap({ brands }: Props) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const featured = brands.filter((b) => FEATURED_SLUGS.includes(b.brandSlug));
  const others = brands.filter((b) => !FEATURED_SLUGS.includes(b.brandSlug));

  return (
    <section
      aria-labelledby="topic-map-title"
      className="relative overflow-hidden rounded-3xl border border-violet-900/40 bg-zinc-950"
    >
      {/* 背景: radial-gradient 紫色辉光 */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(167, 139, 250, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div className="mb-6">
          <p className="text-xs tracking-widest text-violet-400 mb-2">
            VEHICLE TOPICS · 车型专题
          </p>
          <h2
            id="topic-map-title"
            className="text-2xl md:text-3xl font-bold text-white"
          >
            我是 [品牌] 车主 · 按车型找方案
          </h2>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">
            11 个热门品牌 + 13 款主流车型 · 围绕车主视角聚合升级方案
          </p>
        </div>

        {/* 3 重点品牌 (大尺寸) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-3 md:mb-4">
          {featured.map((brand) => (
            <BrandCard
              key={brand.brandSlug}
              brand={brand}
              isHovered={hoveredSlug === brand.brandSlug}
              isFeatured
              onHover={setHoveredSlug}
            />
          ))}
        </div>

        {/* 8 普通品牌 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {others.map((brand) => (
            <BrandCard
              key={brand.brandSlug}
              brand={brand}
              isHovered={hoveredSlug === brand.brandSlug}
              isFeatured={false}
              onHover={setHoveredSlug}
            />
          ))}
        </div>

        {/* 第一人称提示 — 鼠标悬停时同步显示 */}
        <div
          aria-live="polite"
          className="mt-6 h-6 text-sm text-zinc-400 text-center"
        >
          {hoveredSlug ? (
            <span className="text-violet-300">
              {FIRST_PERSON_MAP[hoveredSlug] ?? "查看此品牌车型方案"}
            </span>
          ) : (
            <span className="text-zinc-500">悬停品牌色块，查看车主视角</span>
          )}
        </div>
      </div>
    </section>
  );
}

function BrandCard({
  brand,
  isHovered,
  isFeatured,
  onHover,
}: {
  brand: VehicleBrandRoute;
  isHovered: boolean;
  isFeatured: boolean;
  onHover: (slug: string | null) => void;
}) {
  const dotClass = ACCENT_BG[brand.accentColor];
  const borderClass = isHovered
    ? ACCENT_BORDER[brand.accentColor]
    : "border-zinc-800";
  const textClass = isHovered ? ACCENT_TEXT[brand.accentColor] : "text-zinc-300";

  // featured 用 12px padding + 6px text；其他用 8px padding + 4px text
  const padding = isFeatured ? "p-4 md:p-5" : "p-3 md:p-4";
  const titleSize = isFeatured ? "text-base md:text-lg" : "text-sm";
  const dotSize = isFeatured ? "w-2.5 h-2.5" : "w-2 h-2";

  return (
    <Link
      href={brand.canonicalPath}
      onMouseEnter={() => onHover(brand.brandSlug)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(brand.brandSlug)}
      onBlur={() => onHover(null)}
      className={`group relative block rounded-xl border ${borderClass} bg-zinc-900/60 hover:bg-zinc-900 ${padding} transition-all duration-200 hover:scale-[1.04] hover:shadow-md hover:shadow-black/40`}
      aria-label={`${brand.brandName} 车型方案 ${brand.status === "live" ? "已上线" : "整理中"}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex-shrink-0 ${dotSize} rounded-full ${dotClass}`}
          aria-hidden="true"
        />
        <span className={`${titleSize} font-medium ${textClass} truncate`}>
          {brand.brandName}
        </span>
      </div>
      {brand.modelSlugs.length > 0 ? (
        <p
          className={`mt-1 truncate ${isFeatured ? "text-xs" : "text-[10px]"} text-zinc-500`}
        >
          {brand.modelSlugs.map((m) => m.toUpperCase()).join(" · ")}
        </p>
      ) : (
        <p
          className={`mt-1 ${isFeatured ? "text-xs" : "text-[10px]"} text-zinc-600`}
        >
          {brand.status === "planned" ? "方案整理中" : "即将上线"}
        </p>
      )}
    </Link>
  );
}
