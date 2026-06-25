"use client";

/**
 * MobileProductContent — 移动端三段切换 + 桌面端平铺
 *
 * PRD v3 §4.4:
 * - 移动端 (< 768px): StickyTabBar 显示, 仅 active tab 内容可见
 * - 桌面端 (≥ 768px): StickyTabBar 隐藏 (md:hidden), 3 段内容平铺
 *
 * 用法: 父组件传 3 个 ReactNode (按车型 / 按项目 / 组合)
 * 注意: children 顺序必须与 tabs 顺序一致
 */

import { useState, type ReactNode } from "react";
import { StickyTabBar, type Tab } from "./StickyTabBar";

type Props = {
  tabs: readonly Tab[];
  children: readonly [ReactNode, ReactNode, ReactNode];
};

export function MobileProductContent({ tabs, children }: Props) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "");

  return (
    <div>
      {/* Sticky tab — 移动端 only */}
      <div className="md:hidden">
        <StickyTabBar
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* 3 段内容 — 移动端只显示 active; 桌面端全部平铺 */}
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`tab-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={tab.id}
          className={
            activeTab === tab.id ? "block" : "hidden md:block"
          }
        >
          {children[i]}
        </div>
      ))}
    </div>
  );
}
