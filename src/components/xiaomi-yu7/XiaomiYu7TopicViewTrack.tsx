"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

interface XiaomiYu7TopicViewTrackProps {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
}

/**
 * 小米 YU7 专题页 — 进入 /product/xiaomi/yu7 时触发 pageview 埋点
 * 用 useRef 守卫避免 StrictMode 双调用。
 */
export function XiaomiYu7TopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: XiaomiYu7TopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("xiaomi_yu7_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
