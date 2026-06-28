"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

interface XiaomiSu7TopicViewTrackProps {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
}

export function XiaomiSu7TopicViewTrack({
  topicKey,
  brandSlug,
  modelSlug,
  projectCount,
}: XiaomiSu7TopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("xiaomi_su7_topic_view", {
      topicKey,
      brandSlug,
      modelSlug,
      projectCount,
    });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
