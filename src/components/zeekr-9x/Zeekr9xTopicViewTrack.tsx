"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

interface Zeekr9xTopicViewTrackProps {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
}

/**
 * 极氪 9X 专题页 — 进入 /product/zeekr/9x 时触发 pageview 埋点
 * SPEC §E.1：zeekr_9x_topic_view — metadata 含 topicKey / brandSlug / modelSlug / projectCount
 *
 * React StrictMode 下 useEffect 会双调用；这里用 useRef 守卫，仅首次挂载触发一次。
 */
export function Zeekr9xTopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: Zeekr9xTopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("zeekr_9x_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
