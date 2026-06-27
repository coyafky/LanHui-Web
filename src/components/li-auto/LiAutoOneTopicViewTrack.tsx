"use client";

import { useEffect, useRef } from "react";
import { trackClick } from "@/lib/analytics";

interface LiAutoOneTopicViewTrackProps {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
}

export function LiAutoOneTopicViewTrack({
  topicKey, brandSlug, modelSlug, projectCount,
}: LiAutoOneTopicViewTrackProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (firedRef.current) return;
    firedRef.current = true;
    trackClick("li_auto_one_topic_view", { topicKey, brandSlug, modelSlug, projectCount });
  }, [topicKey, brandSlug, modelSlug, projectCount]);

  return null;
}
