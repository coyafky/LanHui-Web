'use client';

/**
 * 客户端埋点 SDK
 * 支持页面浏览、点击、表单提交、预约、门店访问事件追踪
 */

type EventType = 'pageview' | 'click' | 'form_submit' | 'reservation' | 'store_view';

interface TrackEvent {
  type: EventType;
  pathname: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

const eventBuffer: TrackEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const BUFFER_SIZE = 5;
const FLUSH_INTERVAL = 10000; // 10秒

function flush() {
  if (eventBuffer.length === 0) return;

  const events = eventBuffer.splice(0, eventBuffer.length);

  const payload = JSON.stringify({ events });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', payload);
  } else {
    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

function scheduleFlush() {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_INTERVAL);
}

function track(event: Omit<TrackEvent, 'pathname'> & { pathname?: string }) {
  const fullEvent: TrackEvent = {
    ...event,
    pathname: event.pathname || window.location.pathname,
  };

  eventBuffer.push(fullEvent);

  if (eventBuffer.length >= BUFFER_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
}

/** 追踪页面浏览 */
export function trackPageView(pathname?: string) {
  track({ type: 'pageview', pathname });
}

/** 追踪点击事件 */
export function trackClick(target: string, metadata?: Record<string, unknown>) {
  track({ type: 'click', metadata: { target, ...metadata } });
}

/** 追踪表单提交 */
export function trackFormSubmit(formName: string, metadata?: Record<string, unknown>) {
  track({ type: 'form_submit', metadata: { formName, ...metadata } });
}

/** 追踪门店访问 */
export function trackStoreView(storeId: string) {
  track({ type: 'store_view', storeId });
}

/** 追踪预约事件 */
export function trackReservation(storeId: string, metadata?: Record<string, unknown>) {
  track({ type: 'reservation', storeId, metadata });
}

// 页面卸载时刷新缓冲区
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flush);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}
