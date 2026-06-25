"use client";

/**
 * BrandMatrixMap — 11 品牌色块矩阵
 *
 * 用于 ProductHero，作为"车型方案地图"的视觉核心。
 * 11 个 brand 从 product-routes.ts 读取，每个色块：
 * - 默认：bg-zinc-900/60 + border-zinc-800
 * - hover：色块放大 1.05 + 品牌名浮现 + 边框变色（按 brand.accentColor）
 * - click：进入 /product/{brandSlug}
 */

import { useState } from "react";
import Link from "next/link";
import type { VehicleBrandRoute, AccentColor } from "@/lib/product-routes";

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

const STATUS_LABEL: Record<VehicleBrandRoute["status"], string> = {
  live: "已上线",
  planned: "整理中",
};

type Props = {
  brands: readonly VehicleBrandRoute[];
};

export function BrandMatrixMap({ brands }: Props) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
      role="list"
      aria-label="按品牌找车型方案"
    >
      {brands.map((brand) => {
        const isHovered = hoveredSlug === brand.brandSlug;
        const borderClass = isHovered
          ? ACCENT_BORDER[brand.accentColor]
          : "border-zinc-800";
        const textClass = isHovered ? ACCENT_TEXT[brand.accentColor] : "text-zinc-300";
        const dotClass = ACCENT_BG[brand.accentColor];

        return (
          <Link
            key={brand.brandSlug}
            href={brand.canonicalPath}
            role="listitem"
            onMouseEnter={() => setHoveredSlug(brand.brandSlug)}
            onMouseLeave={() => setHoveredSlug(null)}
            onFocus={() => setHoveredSlug(brand.brandSlug)}
            onBlur={() => setHoveredSlug(null)}
            className={`group/brand relative block rounded-lg border ${borderClass} bg-zinc-900/60 hover:bg-zinc-900 p-2.5 md:p-3 transition-all duration-200 hover:scale-[1.04] hover:shadow-md hover:shadow-black/40`}
            aria-label={`${brand.brandName} 轻改方案 ${STATUS_LABEL[brand.status]}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex-shrink-0 w-2 h-2 rounded-full ${dotClass}`}
                aria-hidden="true"
              />
              <span className={`text-sm font-medium ${textClass} truncate`}>
                {brand.brandName}
              </span>
            </div>
            {brand.modelSlugs.length > 0 ? (
              <p className="text-[10px] text-zinc-500 mt-1 truncate">
                {brand.modelSlugs.map((m) => m.toUpperCase()).join(" · ")}
              </p>
            ) : (
              <p className="text-[10px] text-zinc-600 mt-1">
                {brand.status === "planned" ? "方案整理中" : "即将上线"}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
