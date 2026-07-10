import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useEffect, useState } from 'react';

const trackPageViewMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/analytics', () => ({
  trackPageView: trackPageViewMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';
import { AnalyticsTracker } from './AnalyticsProvider';

const usePathnameMock = usePathname as unknown as ReturnType<typeof vi.fn>;

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    trackPageViewMock.mockClear();
    usePathnameMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('P1: pathname = `/` → trackPageView called once', () => {
    usePathnameMock.mockReturnValue('/');
    render(<AnalyticsTracker />);
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenCalledWith('/');
  });

  it('P2: `/` → `/product` → 2 calls total (last is `/product`)', () => {
    const { rerender } = render(
      <FakeRouter initialPath="/">
        <AnalyticsTracker />
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/');

    rerender(
      <FakeRouter initialPath="/product">
        <AnalyticsTracker />
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(2);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/product');
  });

  it('P3: pathname = `/admin/dashboard` → skipped, 0 calls', () => {
    usePathnameMock.mockReturnValue('/admin/dashboard');
    render(<AnalyticsTracker />);
    expect(trackPageViewMock).not.toHaveBeenCalled();
  });

  it('P4: pathname = `/admin/analytics` → skipped, 0 calls', () => {
    usePathnameMock.mockReturnValue('/admin/analytics');
    render(<AnalyticsTracker />);
    expect(trackPageViewMock).not.toHaveBeenCalled();
  });

  it('P5: `/` → `/admin/x` → `/product` → only public paths counted (2 calls)', () => {
    const { rerender } = render(
      <FakeRouter initialPath="/">
        <AnalyticsTracker />
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);

    usePathnameMock.mockReturnValue('/admin/x');
    rerender(
      <FakeRouter initialPath="/admin/x">
        <AnalyticsTracker />
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);

    usePathnameMock.mockReturnValue('/product');
    rerender(
      <FakeRouter initialPath="/product">
        <AnalyticsTracker />
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(2);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/product');
  });
});

function FakeRouter({
  initialPath,
  children,
}: {
  initialPath: string;
  children: React.ReactNode;
}) {
  usePathnameMock.mockReturnValue(initialPath);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
  }, [initialPath]);
  return <div data-tick={tick}>{children}</div>;
}
