"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

interface NioEs8TopicViewTrackProps {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
}

/**
 * NIO ES8 专题页 — 进入 /product/nio/es8 时触发 pageview 埋点
 * SPEC §E.1：nio_es8_topic_view — metadata 含 topicKey / brandSlug / modelSlug / projectCount
 *
 * React StrictMode 下 useEffect 会双调用；这里用 useRef 守卫，仅首次挂载触发一次。
 */
export function NioEs8TopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: NioEs8TopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("nio_es8_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}