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
const pendingBuffer: TrackEvent[] = []; // BUG-2 修复：正在发送中的事件
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false; // BUG-2 修复：并发锁

const BUFFER_SIZE = 5;
const FLUSH_INTERVAL = 10000; // 10秒

async function flush() {
  if (isFlushing || eventBuffer.length === 0) return;
  isFlushing = true;

  try {
    // 1. 把主 buffer 中所有事件搬到 pending
    const events = eventBuffer.splice(0, eventBuffer.length);
    pendingBuffer.push(...events);

    const payload = JSON.stringify({ events });

    let success = false;
    try {
      if (navigator.sendBeacon) {
        // sendBeacon 返回 false 表示队列满/失败
        success = navigator.sendBeacon('/api/analytics/track', payload);
      } else {
        const res = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        });
        success = res.ok;
      }
    } catch {
      success = false;
    }

    if (success) {
      // 成功：清空 pending
      pendingBuffer.length = 0;
    } else {
      // 失败：把 pending 里的事件放回主 buffer 头部
      eventBuffer.unshift(...pendingBuffer);
      pendingBuffer.length = 0;
      if (typeof console !== 'undefined') {
        console.warn('[analytics] flush failed, events returned to buffer');
      }
    }
  } finally {
    isFlushing = false;
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
