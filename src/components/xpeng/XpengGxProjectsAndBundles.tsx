"use client";

import { useState, useCallback } from "react";
import { XpengGxProjectGrid } from "@/components/xpeng/XpengGxProjectGrid";
import { XpengGxBundleList } from "@/components/xpeng/XpengGxBundleList";
import {
  type XpengGxBundle,
  type XpengGxUpgradeProject,
} from "@/lib/xpeng-gx-products";

type XpengGxProjectsAndBundlesProps = {
  projects: readonly XpengGxUpgradeProject[];
  bundles: readonly XpengGxBundle[];
};

/**
 * 组合组件：ProjectGrid (上) + BundleList (下)
 *
 * 状态提升：高亮 bundleKey 在此组件内管理，BundleList 点击 → 滚动到 ProjectGrid + 高亮
 * 用户决策 #7：组合点击 → 滚动到 ProjectGrid + 高亮组合内项目 + bundle_click 埋点
 *
 * 字段顺序遵循 SPEC §12：ProjectGrid → BundleList
 */
export function XpengGxProjectsAndBundles({
  projects,
  bundles,
}: XpengGxProjectsAndBundlesProps) {
  const [highlightBundleKey, setHighlightBundleKey] = useState<string | null>(
    null,
  );

  const handleBundleClick = useCallback((bundleKey: string) => {
    setHighlightBundleKey((prev) => (prev === bundleKey ? null : bundleKey));
    // 滚动到 ProjectGrid 顶部
    if (typeof window !== "undefined") {
      const el = document.getElementById("xpeng-gx-projects-heading");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  // 从 bundleKey 反查 projectIds（用于高亮）
  const activeBundle = bundles.find((b) => b.key === highlightBundleKey);
  const highlightProjectIds = activeBundle?.projectIds ?? [];

  return (
    <>
      <XpengGxProjectGrid
        projects={projects}
        highlightProjectIds={highlightProjectIds}
      />
      <XpengGxBundleList
        bundles={bundles}
        projects={projects}
        highlightBundleKey={highlightBundleKey}
        onBundleClick={handleBundleClick}
      />
    </>
  );
}