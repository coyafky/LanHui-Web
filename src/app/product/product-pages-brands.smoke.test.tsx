import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { getLiveBrands } from "@/lib/product-routes";

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
    const { fill, priority, placeholder, blurDataURL, ...rest } =
      props as Record<string, unknown>;
    return <img {...rest} />;
  },
}));

// ---------- Mock lucide-react (透传真实实现，图标在 vitest 中正常工作) ----------
vi.mock("lucide-react", async (importOriginal) => {
  return await importOriginal();
});

// ---------- Mock 通用组件 ----------
vi.mock("@/components/Header", () => ({
  Header: () => <div data-testid="Header" />,
}));
vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="Footer" />,
}));
vi.mock("@/components/Breadcrumbs", () => ({
  Breadcrumbs: () => <div data-testid="Breadcrumbs" />,
}));
vi.mock("@/components/product/BrandPlaceholder", () => ({
  BrandPlaceholder: () => <div data-testid="BrandPlaceholder" />,
}));
vi.mock("@/components/cta/PhoneCta", () => ({
  PhoneCta: () => <div data-testid="PhoneCta" />,
}));

// ---------- Mock wenjie 组件 ----------
vi.mock("@/components/wenjie/WenjieSeriesHero", () => ({
  WenjieSeriesHero: () => <div data-testid="WenjieSeriesHero" />,
}));
vi.mock("@/components/wenjie/WenjieSeriesFeaturedGrid", () => ({
  WenjieSeriesFeaturedGrid: () => <div data-testid="WenjieSeriesFeaturedGrid" />,
}));
vi.mock("@/components/wenjie/WenjieSeriesScenarios", () => ({
  WenjieSeriesScenarios: () => <div data-testid="WenjieSeriesScenarios" />,
}));
vi.mock("@/components/wenjie/WenjieSeriesSubModelsGrid", () => ({
  WenjieSeriesSubModelsGrid: () => <div data-testid="WenjieSeriesSubModelsGrid" />,
}));
vi.mock("@/components/wenjie/WenjieSeriesServiceFlow", () => ({
  WenjieSeriesServiceFlow: () => <div data-testid="WenjieSeriesServiceFlow" />,
}));
vi.mock("@/components/wenjie/WenjieSeriesFaq", () => ({
  WenjieSeriesFaq: () => <div data-testid="WenjieSeriesFaq" />,
}));

// ---------- Mock xiaomi 组件 ----------
vi.mock("@/components/xiaomi-series/XiaomiSeriesHero", () => ({
  XiaomiSeriesHero: () => <div data-testid="XiaomiSeriesHero" />,
}));
vi.mock("@/components/xiaomi-series/XiaomiSeriesFeaturedGrid", () => ({
  XiaomiSeriesFeaturedGrid: () => <div data-testid="XiaomiSeriesFeaturedGrid" />,
}));
vi.mock("@/components/xiaomi-series/XiaomiSeriesScenarioMatrix", () => ({
  XiaomiSeriesScenarioMatrix: () => (
    <div data-testid="XiaomiSeriesScenarioMatrix" />
  ),
}));
vi.mock("@/components/xiaomi-series/XiaomiSeriesSubModelsGrid", () => ({
  XiaomiSeriesSubModelsGrid: () => (
    <div data-testid="XiaomiSeriesSubModelsGrid" />
  ),
}));
vi.mock("@/components/xiaomi-series/XiaomiSeriesServiceFlow", () => ({
  XiaomiSeriesServiceFlow: () => <div data-testid="XiaomiSeriesServiceFlow" />,
}));
vi.mock("@/components/xiaomi-series/XiaomiSeriesFaq", () => ({
  XiaomiSeriesFaq: () => <div data-testid="XiaomiSeriesFaq" />,
}));

// ---------- Mock zeekr 组件 ----------
vi.mock("@/components/zeekr/ZeekrAnchorNav", () => ({
  ZeekrAnchorNav: () => <div data-testid="ZeekrAnchorNav" />,
}));
vi.mock("@/components/zeekr/ZeekrProductGrid", () => ({
  ZeekrProductGrid: () => <div data-testid="ZeekrProductGrid" />,
}));
vi.mock("@/components/zeekr/ZeekrProductTable", () => ({
  ZeekrProductTable: () => <div data-testid="ZeekrProductTable" />,
}));

// ---------- Mock li-auto 组件 ----------
vi.mock("@/components/li-auto/LiAutoSeriesHero", () => ({
  LiAutoSeriesHero: () => <div data-testid="LiAutoSeriesHero" />,
}));
vi.mock("@/components/li-auto/LiAutoSeriesFeaturedGrid", () => ({
  LiAutoSeriesFeaturedGrid: () => <div data-testid="LiAutoSeriesFeaturedGrid" />,
}));
vi.mock("@/components/li-auto/LiAutoSeriesScenarios", () => ({
  LiAutoSeriesScenarios: () => <div data-testid="LiAutoSeriesScenarios" />,
}));
vi.mock("@/components/li-auto/LiAutoSeriesMoreChoices", () => ({
  LiAutoSeriesMoreChoices: () => <div data-testid="LiAutoSeriesMoreChoices" />,
}));
vi.mock("@/components/li-auto/LiAutoSeriesSubModelsGrid", () => ({
  LiAutoSeriesSubModelsGrid: () => (
    <div data-testid="LiAutoSeriesSubModelsGrid" />
  ),
}));
vi.mock("@/components/li-auto/LiAutoSeriesServiceFlow", () => ({
  LiAutoSeriesServiceFlow: () => <div data-testid="LiAutoSeriesServiceFlow" />,
}));
vi.mock("@/components/li-auto/LiAutoSeriesFaq", () => ({
  LiAutoSeriesFaq: () => <div data-testid="LiAutoSeriesFaq" />,
}));

// ---------- Mock tesla 组件 ----------
vi.mock("@/components/tesla/TeslaTopicHero", () => ({
  TeslaTopicHero: () => <div data-testid="TeslaTopicHero" />,
}));
vi.mock("@/components/tesla/TeslaFeaturedGrid", () => ({
  TeslaFeaturedGrid: () => <div data-testid="TeslaFeaturedGrid" />,
}));
vi.mock("@/components/tesla/TeslaScenarioMatrix", () => ({
  TeslaScenarioMatrix: () => <div data-testid="TeslaScenarioMatrix" />,
}));
vi.mock("@/components/tesla/TeslaMoreChoices", () => ({
  TeslaMoreChoices: () => <div data-testid="TeslaMoreChoices" />,
}));
vi.mock("@/components/tesla/TeslaModelFitNote", () => ({
  TeslaModelFitNote: () => <div data-testid="TeslaModelFitNote" />,
}));
vi.mock("@/components/tesla/TeslaServiceFlow", () => ({
  TeslaServiceFlow: () => <div data-testid="TeslaServiceFlow" />,
}));
vi.mock("@/components/tesla/TeslaFaq", () => ({
  TeslaFaq: () => <div data-testid="TeslaFaq" />,
}));
vi.mock("@/components/tesla/TeslaTopicViewTrack", () => ({
  TeslaTopicViewTrack: () => <div data-testid="TeslaTopicViewTrack" />,
}));

// ---------- Mock zhijie 组件 ----------
vi.mock("@/components/zhijie/ZhijieBrandHero", () => ({
  ZhijieBrandHero: () => <div data-testid="ZhijieBrandHero" />,
}));
vi.mock("@/components/zhijie/ZhijieBrandServiceFlow", () => ({
  ZhijieBrandServiceFlow: () => <div data-testid="ZhijieBrandServiceFlow" />,
}));

// ---------- 工具函数 ----------
const LIVE_BRANDS = getLiveBrands();
const brandPageModuleMap: Record<string, () => Promise<unknown>> = {
  wenjie: () => import("@/app/product/wenjie/page"),
  xiaomi: () => import("@/app/product/xiaomi/page"),
  zeekr: () => import("@/app/product/zeekr/page"),
  "li-auto": () => import("@/app/product/li-auto/page"),
  tesla: () => import("@/app/product/tesla/page"),
  xpeng: () => import("@/app/product/xpeng/page"),
  denza: () => import("@/app/product/denza/page"),
  voyah: () => import("@/app/product/voyah/page"),
  ledao: () => import("@/app/product/ledao/page"),
  gaoshan: () => import("@/app/product/gaoshan/page"),
  zhijie: () => import("@/app/product/zhijie/page"),
  nio: () => import("@/app/product/nio/page"),
};

async function renderBrandPage(importFn: () => Promise<unknown>) {
  const mod = await importFn();
  const Page = (mod as { default: () => unknown }).default;
  const result = Page();
  if (result instanceof Promise) {
    return render(await result);
  }
  return render(result);
}

// ---------- 品牌页 smoke tests ----------
describe("brand pages smoke tests", () => {
  it.each(LIVE_BRANDS)(
    "$brandName ($brandSlug) renders without crashing",
    async ({ brandSlug }) => {
      const importFn = brandPageModuleMap[brandSlug];
      await renderBrandPage(importFn);
    },
    30000
  );

  it.each(LIVE_BRANDS)(
    "$brandName ($brandSlug) renders content with brand name",
    async ({ brandSlug, brandName }) => {
      const importFn = brandPageModuleMap[brandSlug];
      await renderBrandPage(importFn);
      const body = document.body.textContent ?? "";
      expect(body).toContain(brandName);
    },
    30000
  );
});
