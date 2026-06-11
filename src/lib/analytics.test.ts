import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Analytics SDK unit tests (U1-U10)
 *
 * 策略：
 * - 使用 vi.hoisted 在测试外准备 spy 容器
 * - 同一测试文件内单次 dynamic import，避免 vi.resetModules 引起的
 *   监听器重复注册问题
 * - analytics.ts 的 visibilitychange 监听器挂在 window（不是 document），
 *   因此 U9 需要 dispatch 到 window 才能触发
 */

const spies = vi.hoisted(() => ({
  sendBeacon: vi.fn(() => true),
  fetch: vi.fn(() => Promise.resolve({ ok: true, status: 200 })),
}));

describe('analytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    spies.sendBeacon.mockClear();
    spies.fetch.mockClear();
    spies.sendBeacon.mockReturnValue(true);
    spies.fetch.mockResolvedValue({ ok: true, status: 200 });
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      writable: true,
      value: spies.sendBeacon,
    });
    global.fetch = spies.fetch as unknown as typeof fetch;
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { pathname: '/' } as Location,
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('U1: trackPageView 单次入 buffer + 10s 后被 flush', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/foo');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(spies.sendBeacon).toHaveBeenCalledTimes(1);
    const [url, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    expect(url).toBe('/api/analytics/track');
    const parsed = JSON.parse(payload) as { events: Array<{ type: string; pathname: string }> };
    expect(parsed.events).toEqual([{ type: 'pageview', pathname: '/foo' }]);
  });

  it('U2: 连续 5 次 trackPageView 第 5 次后自动 flush', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/a');
    trackPageView('/b');
    trackPageView('/c');
    trackPageView('/d');
    trackPageView('/e');
    expect(spies.sendBeacon).toHaveBeenCalledTimes(1);
    const [, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    const parsed = JSON.parse(payload) as { events: Array<{ pathname: string }> };
    expect(parsed.events).toHaveLength(5);
    expect(parsed.events.map((e) => e.pathname)).toEqual(['/a', '/b', '/c', '/d', '/e']);
  });

  it('U3: 单次 track + 10s fakeTimer → fetch/sendBeacon 被调 1 次；payload 是 JSON', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/x');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(spies.sendBeacon).toHaveBeenCalledTimes(1);
    const [, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    expect(typeof payload).toBe('string');
    expect(() => JSON.parse(payload)).not.toThrow();
  });

  it('U4: trackClick 携带 metadata', async () => {
    const { trackClick } = await import('./analytics');
    trackClick('btn-1', { x: 10 });
    vi.advanceTimersByTime(10000);
    const [, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    const parsed = JSON.parse(payload) as {
      events: Array<{ type: string; metadata: Record<string, unknown> }>;
    };
    expect(parsed.events[0].type).toBe('click');
    expect(parsed.events[0].metadata).toEqual({ target: 'btn-1', x: 10 });
  });

  it('U5: trackPageView 不传参 → pathname = window.location.pathname', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { pathname: '/test-path' } as Location,
    });
    const { trackPageView } = await import('./analytics');
    trackPageView();
    vi.advanceTimersByTime(10000);
    const [, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    const parsed = JSON.parse(payload) as { events: Array<{ pathname: string }> };
    expect(parsed.events[0].pathname).toBe('/test-path');
  });

  it('U6: trackStoreView 生成 store_view 事件', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: { pathname: '/stores' } as Location,
    });
    const { trackStoreView } = await import('./analytics');
    trackStoreView('s1');
    vi.advanceTimersByTime(10000);
    const [, payload] = spies.sendBeacon.mock.calls[0] as [string, string];
    const parsed = JSON.parse(payload) as {
      events: Array<{ type: string; pathname: string; storeId: string }>;
    };
    expect(parsed.events[0]).toEqual({
      type: 'store_view',
      pathname: '/stores',
      storeId: 's1',
    });
  });

  it('U7: BUG — flush 失败（fetch reject）事件已被 splice 出去，不重试', async () => {
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    spies.fetch.mockRejectedValueOnce(new Error('network'));
    const { trackPageView } = await import('./analytics');
    trackPageView('/lost');
    vi.advanceTimersByTime(10000);
    expect(spies.fetch).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(20000);
    expect(spies.fetch).toHaveBeenCalledTimes(1);
  });

  it('U8: navigator.sendBeacon 存在时优先 sendBeacon，fetch 不被调', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/beacon-path');
    vi.advanceTimersByTime(10000);
    expect(spies.sendBeacon).toHaveBeenCalledTimes(1);
    expect(spies.fetch).not.toHaveBeenCalled();
  });

  it('U9: visibilitychange → hidden 立即 flush（监听器挂在 window 上）', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    const { trackPageView } = await import('./analytics');
    trackPageView('/vis-hidden');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('visibilitychange'));
    expect(spies.sendBeacon).toHaveBeenCalled();
  });

  it('U10: beforeunload 触发立即 flush', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/before-unload');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('beforeunload'));
    expect(spies.sendBeacon).toHaveBeenCalled();
  });
});
