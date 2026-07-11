"use client";

type LiAutoI6TopicViewTrackProps = {
  topicKey: string;
  brandSlug: string;
  modelSlug: string;
  projectCount: number;
};

/**
 * 理想 i6 专题页埋点（静态站点 - 无服务端 API，仅保留组件占位）。
 * 进入页面时触发 topic_view 事件（由客户端 AnalyticsProvider 统一处理）。
 */
export function LiAutoI6TopicViewTrack(_props: LiAutoI6TopicViewTrackProps) {
  return null;
}
