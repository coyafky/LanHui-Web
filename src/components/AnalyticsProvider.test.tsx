import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { useEffect, useState } from 'react';

/**
 * AnalyticsProvider tests (P1-P5)
 *
 * 策略：mock 整个 @/lib/analytics 模块 → 拿到 trackPageView 引用计数。
 * 通过构造一个 fake 父组件 + fake 路由上下文（控制 pathname 变化）
 * 来驱动 AnalyticsProvider 的 useEffect。
 */

const trackPageViewMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/analytics', () => ({
  trackPageView: trackPageViewMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

import { usePathname } from 'next/navigation';
import { AnalyticsProvider } from './AnalyticsProvider';

const usePathnameMock = usePathname as unknown as ReturnType<typeof vi.fn>;

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    trackPageViewMock.mockClear();
    usePathnameMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('P1: 初次 pathname = `/` → trackPageView 调 1 次', () => {
    usePathnameMock.mockReturnValue('/');
    render(
      <AnalyticsProvider>
        <div>child</div>
      </AnalyticsProvider>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenCalledWith('/');
  });

  it('P2: `/` → `/product` 共调 2 次（最后一次 `/product`）', () => {
    // 同一组件生命周期内 pathname 变化（react rerender）
    // 使用一个外部可控的 pathname 状态
    const { rerender } = render(
      <FakeRouter initialPath="/">
        <AnalyticsProvider>
          <div>child</div>
        </AnalyticsProvider>
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/');
    // 切换到 /product
    rerender(
      <FakeRouter initialPath="/product">
        <AnalyticsProvider>
          <div>child</div>
        </AnalyticsProvider>
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(2);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/product');
  });

  it('P3: 初次 pathname = `/admin/dashboard` → 跳过，0 次', () => {
    usePathnameMock.mockReturnValue('/admin/dashboard');
    render(
      <AnalyticsProvider>
        <div>child</div>
      </AnalyticsProvider>,
    );
    expect(trackPageViewMock).not.toHaveBeenCalled();
  });

  it('P4: 初次 pathname = `/admin/analytics` → 跳过，0 次', () => {
    usePathnameMock.mockReturnValue('/admin/analytics');
    render(
      <AnalyticsProvider>
        <div>child</div>
      </AnalyticsProvider>,
    );
    expect(trackPageViewMock).not.toHaveBeenCalled();
  });

  it('P5: `/` → `/admin/x` → `/product` 仅前台路径计数 = 2 次', () => {
    const { rerender } = render(
      <FakeRouter initialPath="/">
        <AnalyticsProvider>
          <div>child</div>
        </AnalyticsProvider>
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);

    // 切到 admin
    usePathnameMock.mockReturnValue('/admin/x');
    rerender(
      <FakeRouter initialPath="/admin/x">
        <AnalyticsProvider>
          <div>child</div>
        </AnalyticsProvider>
      </FakeRouter>,
    );
    // admin 跳过，计数仍为 1
    expect(trackPageViewMock).toHaveBeenCalledTimes(1);

    // 切到 /product
    usePathnameMock.mockReturnValue('/product');
    rerender(
      <FakeRouter initialPath="/product">
        <AnalyticsProvider>
          <div>child</div>
        </AnalyticsProvider>
      </FakeRouter>,
    );
    expect(trackPageViewMock).toHaveBeenCalledTimes(2);
    expect(trackPageViewMock).toHaveBeenLastCalledWith('/product');
  });
});

/**
 * FakeRouter：在 render 期间根据 initialPath 把 usePathname mock 切到该值。
 * 注意：usePathname 的 mock 在 module 级别，每次重 render 时需要
 * 在 useEffect 中重新设置（因为 react strict 双调用 + 闭包时机）。
 */
function FakeRouter({
  initialPath,
  children,
}: {
  initialPath: string;
  children: React.ReactNode;
}) {
  usePathnameMock.mockReturnValue(initialPath);
  // 触发子组件 useEffect 执行（确保 pathname 变化被读到）
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick((t) => t + 1);
  }, [initialPath]);
  return <div data-tick={tick}>{children}</div>;
}
