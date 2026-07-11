import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
      configurable: true, writable: true, value: spies.sendBeacon,
    });
    global.fetch = spies.fetch as unknown as typeof fetch;
    Object.defineProperty(window, 'location', {
      configurable: true, writable: true, value: { pathname: '/' } as Location,
    });
    Object.defineProperty(document, 'visibilityState', {
      configurable: true, get: () => 'visible',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('U1: trackPageView → 10s 后被 flush via fetch', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/foo');
    expect(spies.fetch).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10000);
    expect(spies.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    expect(url).toBe('/api/analytics/track');
    const parsed = JSON.parse(init.body) as { events: Array<{ type: string; pathname: string }> };
    expect(parsed.events[0].type).toBe('pageview');
    expect(parsed.events[0].pathname).toBe('/foo');
  });

  it('U2: 连续 5 次 → 第 5 次后自动 flush via fetch', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/a'); trackPageView('/b'); trackPageView('/c');
    trackPageView('/d'); trackPageView('/e');
    expect(spies.fetch).toHaveBeenCalledTimes(1);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    const parsed = JSON.parse(init.body) as { events: Array<{ pathname: string }> };
    expect(parsed.events).toHaveLength(5);
  });

  it('U3: track + 10s → fetch call, payload is valid JSON', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/x');
    vi.advanceTimersByTime(10000);
    expect(spies.fetch).toHaveBeenCalledTimes(1);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    expect(typeof init.body).toBe('string');
    expect(() => JSON.parse(init.body)).not.toThrow();
  });

  it('U4: trackClick carries metadata', async () => {
    const { trackClick } = await import('./analytics');
    trackClick('btn-1', { x: 10 });
    vi.advanceTimersByTime(10000);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    const parsed = JSON.parse(init.body) as {
      events: Array<{ type: string; metadata: Record<string, unknown> }>;
    };
    expect(parsed.events[0].type).toBe('click');
    expect(parsed.events[0].metadata).toEqual({ target: 'btn-1', x: 10 });
  });

  it('U5: trackPageView without pathname uses location.pathname', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true, writable: true, value: { pathname: '/test-path' } as Location,
    });
    const { trackPageView } = await import('./analytics');
    trackPageView();
    vi.advanceTimersByTime(10000);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    const parsed = JSON.parse(init.body) as { events: Array<{ pathname: string }> };
    expect(parsed.events[0].pathname).toBe('/test-path');
  });

  it('U6: trackStoreView generates store_view event', async () => {
    const { trackStoreView } = await import('./analytics');
    trackStoreView('s1');
    vi.advanceTimersByTime(10000);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    const parsed = JSON.parse(init.body) as {
      events: Array<{ type: string; pathname: string; storeId: string }>;
    };
    expect(parsed.events[0]).toMatchObject({
      type: 'store_view', storeId: 's1',
    });
  });

  it('U7: flush failure (500) → events requeued and retry scheduled', async () => {
    spies.fetch.mockRejectedValueOnce(new Error('network'));
    const { trackPageView } = await import('./analytics');
    trackPageView('/lost');
    vi.advanceTimersByTime(10000);
    // fetch was called but rejected
    expect(spies.fetch).toHaveBeenCalledTimes(1);
    // After failure, retry should be scheduled. Advance past retry delay.
    spies.fetch.mockResolvedValueOnce({ ok: true, status: 200 });
    await vi.advanceTimersByTimeAsync(10000);
    // Retry should have been triggered
    expect(spies.fetch).toHaveBeenCalledTimes(2);
  });

  it('U8: events include eventId for deduplication', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/dedup');
    vi.advanceTimersByTime(10000);
    const [, init] = spies.fetch.mock.calls[0] as [string, { body: string }];
    const parsed = JSON.parse(init.body) as { events: Array<{ eventId: string }> };
    expect(typeof parsed.events[0].eventId).toBe('string');
    expect(parsed.events[0].eventId.length).toBeGreaterThan(0);
  });

  it('U9: visibilitychange → hidden → sendBeacon (best-effort unload)', async () => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true, get: () => 'hidden',
    });
    const { trackPageView } = await import('./analytics');
    trackPageView('/vis-hidden');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('visibilitychange'));
    expect(spies.sendBeacon).toHaveBeenCalled();
  });

  it('U10: beforeunload → sendBeacon (best-effort unload)', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/before-unload');
    expect(spies.sendBeacon).not.toHaveBeenCalled();
    window.dispatchEvent(new Event('beforeunload'));
    expect(spies.sendBeacon).toHaveBeenCalled();
  });
});
