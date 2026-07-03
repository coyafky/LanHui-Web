"use client";

import { useState, useCallback } from "react";
import { XpengGxProjectGrid } from "@/components/xpeng/XpengGxProjectGrid";
import { XpengGxBundleList } from "@/components/xpeng/XpengGxBundleList";
import {
  type XpengGxBundle,
  type XpengGxScenario,
  type XpengGxUpgradeProject,
} from "@/lib/xpeng-gx-products";

type XpengGxProjectsAndBundlesProps = {
  projects: readonly XpengGxUpgradeProject[];
  scenarios: readonly XpengGxScenario[];
  bundles: readonly XpengGxBundle[];
};

/**
 * 组合组件：ProjectGrid (上) + BundleList (下)
 *
 * 兼容保留：页面主流程已对齐极氪 9X，直接使用 XpengGxProjectGrid。
 * 若旧入口继续使用本组件，BundleList 点击仍会滚动到 ProjectGrid。
 *
 * 字段顺序遵循 SPEC §12：ProjectGrid → BundleList
 */
export function XpengGxProjectsAndBundles({
  projects,
  scenarios,
  bundles,
}: XpengGxProjectsAndBundlesProps) {
  const [highlightBundleKey, setHighlightBundleKey] = useState<string | null>(
    null,
  );

  const handleBundleClick = useCallback((bundleKey: string) => {
    setHighlightBundleKey((prev) => (prev === bundleKey ? null : bundleKey));
    // 滚动到 ProjectGrid 顶部
    if (typeof window !== "undefined") {
      const el = document.getElementById("xpeng-gx-project-grid");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  return (
    <>
      <XpengGxProjectGrid
        projects={projects}
        scenarios={scenarios}
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
