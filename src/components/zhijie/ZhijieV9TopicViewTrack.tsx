"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics";

interface ZhijieV9TopicViewTrackProps {
  topicKey: string;
  totalProjects: number;
  totalScenarios: number;
  totalBundles: number;
}

/**
 * 智界 V9 专题页 — 进入 /product/zhijie/v9 时触发 pageview 埋点
 * SPEC §E.1：product_topic_view (通用事件) — metadata 含 topicKey + 数量统计
 */
export function ZhijieV9TopicViewTrack({
  topicKey,
  totalProjects,
  totalScenarios,
  totalBundles,
}: ZhijieV9TopicViewTrackProps) {
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
