"use client";

import { trackClick } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type AnchorItem = { id: string; label: string };

type ZeekrAnchorNavProps = {
  models: AnchorItem[];
};

/**
 * 车型锚点导航（桌面端）
 * PRD §8.2：使用锚点跳转，点击触发 zeekr_model_section_click 埋点
 * 主题色：orange-500/400（与 xiaomi 主题色一致，区别于 wenjie cyan）
 */
export function ZeekrAnchorNav({ models }: ZeekrAnchorNavProps) {
  return (
    <nav
      aria-label="车型锚点导航"
      className="hidden md:flex items-center gap-2 sticky top-20 z-20 bg-zinc-950/80 backdrop-blur border-y border-zinc-900 py-3"
    >
      <span className="text-xs tracking-widest text-zinc-500 mr-2">
        MODEL
      </span>
      {models.map((m, idx) => (
        <a
          key={m.id}
          href={`#${m.id}`}
          onClick={() =>
            trackClick("zeekr_model_section_click", {
              model: m.id,
              index: idx,
            })
          }
          className={cn(
            "inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium",
            "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-orange-400 transition-colors",
          )}
        >
          {m.label}
        </a>
      ))}
    </nav>
  );
}
