import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ANALYTICS_EVENT } from './analytics';

const spies = vi.hoisted(() => ({
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe('analytics', () => {
  beforeEach(() => {
    spies.addEventListener.mockClear();
    spies.dispatchEvent.mockClear();
    window.addEventListener = spies.addEventListener as unknown as typeof window.addEventListener;
    window.dispatchEvent = spies.dispatchEvent as unknown as typeof window.dispatchEvent;
    Object.defineProperty(window, 'location', {
      configurable: true, writable: true, value: { pathname: '/' } as Location,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('trackPageView dispatches CustomEvent with pageview type', async () => {
    const { trackPageView } = await import('./analytics');
    trackPageView('/foo');

    expect(spies.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe(ANALYTICS_EVENT);
    expect(event.detail.type).toBe('pageview');
    expect(event.detail.pathname).toBe('/foo');
  });

  it('trackPageView without pathname uses location.pathname', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true, writable: true, value: { pathname: '/test-path' } as Location,
    });
    const { trackPageView } = await import('./analytics');
    trackPageView();

    expect(spies.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.detail.pathname).toBe('/test-path');
  });

  it('trackClick dispatches CustomEvent with click type and metadata', async () => {
    const { trackClick } = await import('./analytics');
    trackClick('btn-1', { x: 10 });

    expect(spies.dispatchEvent).toHaveBeenCalledTimes(1);
    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.detail.type).toBe('click');
    expect(event.detail.metadata).toEqual({ target: 'btn-1', x: 10 });
  });

  it('trackFormSubmit dispatches CustomEvent with form_submit type', async () => {
    const { trackFormSubmit } = await import('./analytics');
    trackFormSubmit('contact-form', { name: 'test' });

    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.detail.type).toBe('form_submit');
    expect(event.detail.metadata).toEqual({ formName: 'contact-form', name: 'test' });
  });

  it('trackStoreView dispatches CustomEvent with store_view type', async () => {
    const { trackStoreView } = await import('./analytics');
    trackStoreView('s1');

    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toMatchObject({
      type: 'store_view',
      storeId: 's1',
    });
  });

  it('trackReservation dispatches CustomEvent with reservation type', async () => {
    const { trackReservation } = await import('./analytics');
    trackReservation('s1', { service: 'window-film' });

    const event = spies.dispatchEvent.mock.calls[0][0] as CustomEvent;
    expect(event.detail.type).toBe('reservation');
    expect(event.detail.storeId).toBe('s1');
  });

  it('does NOT call fetch or sendBeacon', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const beaconSpy = vi.spyOn(navigator, 'sendBeacon');

    const { trackPageView, trackClick } = await import('./analytics');
    trackPageView('/x');
    trackClick('btn');

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
    beaconSpy.mockRestore();
  });

  it('no-op when window is undefined (SSR-safe)', async () => {
    const windowBackup = globalThis.window;
    // @ts-expect-error: simulate SSR
    delete globalThis.window;

    const { trackPageView } = await import('./analytics');
    expect(() => trackPageView('/ssr')).not.toThrow();

    globalThis.window = windowBackup;
  });
});
