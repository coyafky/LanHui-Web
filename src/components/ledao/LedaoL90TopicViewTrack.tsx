"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics";

interface LedaoL90TopicViewTrackProps {
  topicKey: string;
  totalProjects: number;
  totalScenarios: number;
}

/**
 * 乐道 L90 专题页 — 进入 /product/ledao/l90 时触发 pageview 埋点
 * SPEC §E.1：product_topic_view (通用事件) — metadata 含 topicKey + 数量统计
 */
export function LedaoL90TopicViewTrack({
  topicKey,
  totalProjects,
  totalScenarios,
}: LedaoL90TopicViewTrackProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    trackClick("product_topic_view", {
      topicKey,
      totalProjects,
      totalScenarios,
    });
  }, [topicKey, totalProjects, totalScenarios]);

  return null;
}
