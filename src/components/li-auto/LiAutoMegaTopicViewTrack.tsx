"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

export type LiAutoMegaTopicViewTrackProps = {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
};

/**
 * 理想 MEGA 专题页 — 进入 /product/li-auto/mega 时触发 pageview 埋点
 * plan §C.6：li_auto_mega_topic_view — metadata 含 topicKey / brandSlug / modelSlug / projectCount
 *
 * React StrictMode 下 useEffect 会双调用；这里用 useRef 守卫，仅首次挂载触发一次。
 */
export function LiAutoMegaTopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: LiAutoMegaTopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("li_auto_mega_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
