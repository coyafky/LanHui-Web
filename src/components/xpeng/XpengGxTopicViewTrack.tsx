"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics";

interface XpengGxTopicViewTrackProps {
  topicKey: string;
  totalProjects: number;
  totalScenarios: number;
  totalBundles: number;
}

/**
 * 小鹏 GX 专题页 — 进入 /product/xpeng/gx 时触发 pageview 埋点
 * SPEC §E.1：product_topic_view (通用事件) — metadata 含 topicKey + 数量统计
 */
export function XpengGxTopicViewTrack({
  topicKey,
  totalProjects,
  totalScenarios,
  totalBundles,
}: XpengGxTopicViewTrackProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    trackClick("product_topic_view", {
      topicKey,
      totalProjects,
      totalScenarios,
      totalBundles,
    });
  }, [topicKey, totalProjects, totalScenarios, totalBundles]);

  return null;
}