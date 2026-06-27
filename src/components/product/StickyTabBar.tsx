"use client";

/**
 * StickyTabBar — 移动端 sticky 三段切换 tab
 *
 * PRD v3 §4.4.1：
 * - 显示条件: viewport < 768px (md:hidden)
 * - 高度: 56px
 * - 位置: position: sticky; top: 64px (Header 64px 之下)
 * - z-index: z-50
 * - 背景: zinc-950/80 backdrop-blur-md
 * - Tab 数: 3 (按车型 / 按项目 / 组合)
 * - Active 标识: 下划线 4px, 对应业务色
 * - 状态: useState 本地, 不持久化
 *
 * 配套 MobileProductContent 使用 — 桌面端 md:hidden, 移动端 sticky
 */

import type { AccentColor } from "@/lib/product-routes";

export type Tab = {
  id: string;
  label: string;
  accentColor: AccentColor;
};

type Props = {
  tabs: readonly Tab[];
  activeTab: string;
  onChange: (id: string) => void;
};

const ACCENT_BG: Record<AccentColor, string> = {
  cyan: "bg-cyan-400",
  orange: "bg-orange-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-400",
  violet: "bg-violet-400",
  pink: "bg-pink-400",
  blue: "bg-blue-400",
  teal: "bg-teal-400",
  red: "bg-red-400",
  sky: "bg-sky-400",
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
  sky: "text-sky-300",
};

export function StickyTabBar({ tabs, activeTab, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="产品中心内容切换"
      className="sticky top-16 z-50 bg-zinc-950/80 backdrop-blur-md border-y border-zinc-800"
    >
      <div className="flex h-14 items-stretch">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const accentBg = ACCENT_BG[tab.accentColor];
          const accentText = ACCENT_TEXT[tab.accentColor];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 px-3 text-sm font-medium transition-colors ${
                isActive
                  ? `${accentText}`
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
              {/* Active 下划线 4px */}
              <span
                aria-hidden="true"
                className={`absolute bottom-0 left-0 right-0 h-1 transition-opacity ${
                  isActive ? `opacity-100 ${accentBg}` : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
