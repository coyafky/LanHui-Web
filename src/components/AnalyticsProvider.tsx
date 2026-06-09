'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackPageView } from '@/lib/analytics';

/**
 * 自动页面追踪 Provider
 * 在路由变化时自动调用 trackPageView
 * 跳过 /admin 路由，不追踪后台管理页面
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Skip admin routes
    if (pathname.startsWith('/admin')) return;
    trackPageView(pathname);
  }, [pathname]);

  return <>{children}</>;
}
