"use client";

import { useEffect } from "react";
import { trackClick } from "@/lib/analytics";

interface TeslaTopicViewTrackProps {
  topicKey: string;
  totalProjects: number;
  totalScenarios: number;
}

export function TeslaTopicViewTrack({
  topicKey,
  totalProjects,
  totalScenarios,
}: TeslaTopicViewTrackProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    trackClick("tesla_topic_view", {
      topicKey,
      totalProjects,
      totalScenarios,
    });
  }, [topicKey, totalProjects, totalScenarios]);

  return null;
}
