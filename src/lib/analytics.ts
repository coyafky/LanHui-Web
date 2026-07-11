'use client';

type EventType = 'pageview' | 'click' | 'form_submit' | 'reservation' | 'store_view';

interface TrackEvent {
  type: EventType;
  pathname: string;
  storeId?: string;
  metadata?: Record<string, unknown>;
}

export const ANALYTICS_EVENT = 'lanhui:analytics';

function dispatch(event: TrackEvent): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<TrackEvent>(ANALYTICS_EVENT, {
      detail: event,
      bubbles: false,
    }),
  );
}

function track(event: Omit<TrackEvent, 'pathname'> & { pathname?: string }): void {
  dispatch({
    ...event,
    pathname: event.pathname || (typeof window !== 'undefined' ? window.location.pathname : '/'),
  });
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
