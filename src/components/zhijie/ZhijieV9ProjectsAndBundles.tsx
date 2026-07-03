"use client";

import { useState, useCallback } from "react";
import { ZhijieV9ProjectGrid } from "@/components/zhijie/ZhijieV9ProjectGrid";
import { ZhijieV9BundleList } from "@/components/zhijie/ZhijieV9BundleList";
import {
  type ZhijieV9Bundle,
  type ZhijieV9UpgradeProject,
} from "@/lib/zhijie-v9-products";

type ZhijieV9ProjectsAndBundlesProps = {
  projects: readonly ZhijieV9UpgradeProject[];
  bundles: readonly ZhijieV9Bundle[];
};

/**
 * 组合组件：ProjectGrid (上) + BundleList (下)
 *
 * 状态提升：高亮 bundleKey 在此组件内管理，BundleList 点击 → 滚动到 ProjectGrid + 高亮
 * 用户决策 #7：组合点击 → 滚动到 ProjectGrid + 高亮组合内项目 + bundle_click 埋点
 *
 * 字段顺序遵循 SPEC §12：ProjectGrid → BundleList
 */
export function ZhijieV9ProjectsAndBundles({
  projects,
  bundles,
}: ZhijieV9ProjectsAndBundlesProps) {
  const [highlightBundleKey, setHighlightBundleKey] = useState<string | null>(
    null,
  );

  const handleBundleClick = useCallback((bundleKey: string) => {
    setHighlightBundleKey((prev) => (prev === bundleKey ? null : bundleKey));
    // 滚动到 ProjectGrid 顶部
    if (typeof window !== "undefined") {
      const el = document.getElementById("zhijie-v9-projects-heading");
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
      <ZhijieV9ProjectGrid
        projects={projects}
        highlightProjectIds={highlightProjectIds}
      />
      <ZhijieV9BundleList
        bundles={bundles}
        projects={projects}
        highlightBundleKey={highlightBundleKey}
        onBundleClick={handleBundleClick}
      />
    </>
  );
}
