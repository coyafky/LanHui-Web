'use client';

type EventType = 'pageview' | 'click' | 'form_submit' | 'reservation' | 'store_view';

interface TrackEvent {
  type: EventType;
  pathname: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

interface QueuedEvent extends TrackEvent {
  /** 客户端生成的幂等 ID，服务端 24h 去重 */
  eventId: string;
  /** 首次尝试时间戳 */
  createdAt: number;
  /** 已重试次数 */
  retries: number;
}

const eventBuffer: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let isFlushing = false;

const BUFFER_SIZE = 5;
const FLUSH_INTERVAL = 10_000;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 2_000;

let eventSeq = 0;
function makeEventId(): string {
  eventSeq = (eventSeq + 1) % 1_000_000;
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${eventSeq}`;
}

/** 指数退避: 2^(retries-1) * base, max 30s */
function retryDelay(retries: number): number {
  return Math.min(Math.pow(2, retries - 1) * RETRY_BASE_MS, 30_000);
}

async function flush(): Promise<void> {
  if (isFlushing || eventBuffer.length === 0) return;
  isFlushing = true;

  const batch = eventBuffer.splice(0, eventBuffer.length);
  const payload = JSON.stringify({ events: batch });

  try {
    const res = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    });

    if (res.ok) {
      return; // success, events removed from buffer
    }

    // Server error (5xx) or rate limit (429): retry
    if (res.status >= 500 || res.status === 429) {
      requeueBatch(batch);
    }
    // Client error (4xx): discard malformed events
  } catch {
    // Network error: retry
    requeueBatch(batch);
  } finally {
    isFlushing = false;
  }
}

function requeueBatch(batch: QueuedEvent[]): void {
  for (const ev of batch) {
    ev.retries += 1;
    if (ev.retries < MAX_RETRIES) {
      eventBuffer.unshift(ev);
    }
    // Drop events that exceeded retry limit
  }
  if (eventBuffer.length > 0) {
    scheduleRetryFlush();
  }
}

function scheduleRetryFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  const maxRetry = Math.max(...eventBuffer.map((e) => e.retries), 1);
  flushTimer = setTimeout(flush, retryDelay(maxRetry));
}

/** 页面卸载时：sendBeacon 尽力发送，不验证结果 */
function flushOnUnload(): void {
  if (eventBuffer.length === 0) return;
  const batch = eventBuffer.splice(0, eventBuffer.length);
  const payload = JSON.stringify({ events: batch });
  // sendBeacon is fire-and-forget — acceptable for page unload
  try {
    navigator.sendBeacon('/api/analytics/track', payload);
  } catch {
    // silently drop on unload
  }
}

function scheduleFlush(): void {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(flush, FLUSH_INTERVAL);
}

function track(event: Omit<TrackEvent, 'pathname'> & { pathname?: string }): void {
  const queued: QueuedEvent = {
    ...event,
    pathname: event.pathname || window.location.pathname,
    eventId: makeEventId(),
    createdAt: Date.now(),
    retries: 0,
  };

  eventBuffer.push(queued);

  if (eventBuffer.length >= BUFFER_SIZE) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function trackPageView(pathname?: string) {
  track({ type: 'pageview', pathname });
}

export function trackClick(target: string, metadata?: Record<string, unknown>) {
  track({ type: 'click', metadata: { target, ...metadata } });
}

export function trackFormSubmit(formName: string, metadata?: Record<string, unknown>) {
  track({ type: 'form_submit', metadata: { formName, ...metadata } });
}

export function trackStoreView(storeId: string) {
  track({ type: 'store_view', storeId });
}

export function trackReservation(storeId: string, metadata?: Record<string, unknown>) {
  track({ type: 'reservation', storeId, metadata });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', flushOnUnload);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushOnUnload();
  });
}
