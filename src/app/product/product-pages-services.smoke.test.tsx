import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { getLiveServices } from "@/lib/product-routes";

// ---------- Mock 基础设施 ----------
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/product/test",
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, ...rest } = props;
    return <img {...rest} />;
  },
}));

// ---------- Mock 通用组件 ----------
vi.mock("@/components/Header", () => ({
  Header: () => <div data-testid="Header" />,
}));
vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="Footer" />,
}));

/**
 * 渲染服务页：同时支持 async Server Component 和 sync 组件。
 * async 组件不能在 React 客户端直接 <Page /> 渲染，需先调用并 await。
 */
async function renderServicePage(importFn: () => Promise<unknown>) {
  const mod = await importFn();
  const Page = (mod as { default: (...args: unknown[]) => unknown }).default;
  const result = Page();
  if (result instanceof Promise) {
    // 处理 async Server Component：await 出 JSX 后再 render
    const element = await result;
    return render(element as React.ReactElement);
  }
  return render(result as React.ReactElement);
}

const LIVE_SERVICES = getLiveServices();
const serviceSlugPageModuleMap: Record<string, () => Promise<unknown>> = {
  ppf: () => import("@/app/product/ppf/page"),
  "window-film": () => import("@/app/product/window-film/page"),
  "color-film": () => import("@/app/product/color-film/page"),
  "electric-steps": () => import("@/app/product/electric-steps/page"),
  wheels: () => import("@/app/product/wheels/page"),
  chassis: () => import("@/app/product/chassis/page"),
  flooring: () => import("@/app/product/flooring/page"),
  "floor-mats": () => import("@/app/product/floor-mats/page"),
  "car-care": () => import("@/app/product/car-care/page"),
};

describe.each(LIVE_SERVICES)(
  "Service page: $navLabel ($serviceSlug)",
  ({ serviceSlug, navLabel }) => {
    const importFn = serviceSlugPageModuleMap[serviceSlug];

    it("renders without crashing", async () => {
      await renderServicePage(importFn);
    });

    it("renders content area with service title", async () => {
      await renderServicePage(importFn);
      // 检验 navLabel（中文服务名）出现在页面上
      const body = document.body.textContent ?? "";
      expect(body).toContain(navLabel);
    });
  }
);
