"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

type Zeekr8xTopicViewTrackProps = {
  readonly topicKey: string;
  readonly brandSlug: string;
  readonly modelSlug: string;
  readonly projectCount: number;
};

/**
 * 极氪 8X 专题页 — 进入 /product/zeekr/8x 时触发 pageview 埋点
 * React StrictMode 下 useEffect 会双调用；用 useRef 守卫，仅首次挂载触发一次。
 */
export function Zeekr8xTopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: Zeekr8xTopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("zeekr_8x_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
