"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics";

interface VoyahDreamerTopicViewTrackProps {
  topicKey: string;
  totalProjects: number;
  totalScenarios: number;
}

/**
 * 岚图梦想家专题页 — 进入 /product/voyah/dreamer 时触发 pageview 埋点
 * SPEC §E.1：product_topic_view (通用事件) — metadata 含 topicKey + 数量统计
 */
export function VoyahDreamerTopicViewTrack({
  topicKey,
  totalProjects,
  totalScenarios,
}: VoyahDreamerTopicViewTrackProps) {
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
