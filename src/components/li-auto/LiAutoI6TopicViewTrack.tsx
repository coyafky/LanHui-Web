"use client";

import { useEffect, useRef } from "react";

type LiAutoI6TopicViewTrackProps = {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
};

/**
 * 理想 i6 专题页埋点（PRD §14）
 * 进入页面时触发 topic_view 事件。
 */
export function LiAutoI6TopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: LiAutoI6TopicViewTrackProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    // 服务端埋点：/api/analytics/track
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "product_topic_view",
        payload: { topic: topicKey, brandSlug, modelSlug, projectCount },
      }),
    }).catch(() => {
      // 静默失败，不阻塞页面
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
