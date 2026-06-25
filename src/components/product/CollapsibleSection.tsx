"use client";

/**
 * CollapsibleSection — P1 项目折叠 (移动端)
 *
 * PRD v3 §4.5:
 * - 触发条件: viewport < 768px + P1 项目区
 * - 默认状态: 折叠 (只显示前 maxVisible 个, 默认 4)
 * - 展开按钮: "展开更多 (+N)" / "收起"
 * - 动效: height 0→auto + opacity, 250ms ease-out
 * - 状态: useState 纯前端, 刷新后恢复默认
 * - 桌面端 (≥ 768px): 不折叠, 全部平铺
 *
 * 用法: 包裹 children, 移动端默认折叠前 maxVisible 个
 */

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  defaultExpanded?: boolean;
  maxVisible?: number;
  children: ReactNode;
  triggerLabel?: (visible: number, total: number) => string;
};

export function CollapsibleSection({
  defaultExpanded = false,
  maxVisible = 4,
  children,
  triggerLabel,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  // children 可能是数组或单个; 转为数组处理
  const childArray = Array.isArray(children) ? children : [children];
  const total = childArray.length;
  const visible = expanded ? total : Math.min(maxVisible, total);
  const visibleItems = childArray.slice(0, visible);
  const hiddenCount = total - visible;
  const showTrigger = total > maxVisible;

  const defaultLabel = (v: number, t: number) =>
    v >= t ? "收起" : `展开更多（+${t - v}）`;

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 可见区 */}
      <div className="space-y-3 md:space-y-4">
        {visibleItems.map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>

      {/* 折叠区 — 移动端用 height/opacity 动画, 桌面端 md:!h-auto md:!opacity-100 始终展开 */}
      {showTrigger && (
        <>
          <div
            className={`space-y-3 md:space-y-4 overflow-hidden transition-all duration-300 ease-out ${
              expanded
                ? "max-h-[5000px] opacity-100"
                : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
            }`}
            aria-hidden={!expanded}
          >
            {childArray.slice(maxVisible).map((child, i) => (
              <div key={i + maxVisible}>{child}</div>
            ))}
          </div>

          {/* 展开/收起按钮 — 仅移动端显示 */}
          <div className="md:hidden flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 hover:text-white transition-colors"
              aria-expanded={expanded}
            >
              {(triggerLabel ?? defaultLabel)(visible, total)}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
