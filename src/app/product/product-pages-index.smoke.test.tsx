import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// ---------- Mock 基础设施 ----------
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/product",
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

// ---------- Mock lucide-react (透传真实实现) ----------
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
vi.mock("@/components/cta/PhoneCta", () => ({
  PhoneCta: () => <div data-testid="PhoneCta" />,
}));

// ---------- Mock 产品页专用组件 (9 个) ----------
vi.mock("@/components/product/ProductHero", () => ({
  ProductHero: () => <div data-testid="ProductHero">产品中心</div>,
}));
vi.mock("@/components/product/FilmServiceMap", () => ({
  FilmServiceMap: ({ services }: { services: Array<{ title: string }> }) => (
    <div data-testid="FilmServiceMap">
      {services.map((s) => s.title).join(",")}
    </div>
  ),
}));
vi.mock("@/components/product/LightModMap", () => ({
  LightModMap: ({ services }: { services: Array<{ title: string }> }) => (
    <div data-testid="LightModMap">
      {services.map((s) => s.title).join(",")}
    </div>
  ),
}));
vi.mock("@/components/product/VehicleTopicMap", () => ({
  VehicleTopicMap: ({ brands }: { brands: Array<{ brandName: string }> }) => (
    <div data-testid="VehicleTopicMap">
      {brands.map((b) => b.brandName).join(",")}
    </div>
  ),
}));
vi.mock("@/components/product/CollapsibleSection", () => ({
  CollapsibleSection: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="CollapsibleSection">{children}</div>
  ),
}));
vi.mock("@/components/product/MobileProductContent", () => ({
  MobileProductContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="MobileProductContent">{children}</div>
  ),
}));
vi.mock("@/components/product/P1ServiceCard", () => ({
  P1ServiceCard: () => <div data-testid="P1ServiceCard" />,
}));
vi.mock("@/components/product/PracticalAccessoryMap", () => ({
  PracticalAccessoryMap: ({
    services,
  }: {
    services: Array<{ title: string }>;
  }) => (
    <div data-testid="PracticalAccessoryMap">
      {services.map((s) => s.title).join(",")}
    </div>
  ),
}));
vi.mock("@/components/product/CarCareServiceMap", () => ({
  CarCareServiceMap: ({
    services,
  }: {
    services: Array<{ title: string }>;
  }) => (
    <div data-testid="CarCareServiceMap">
      {services.map((s) => s.title).join(",")}
    </div>
  ),
}));

// ---------- 渲染 helper ----------
async function renderProductPage() {
  const mod = await import("@/app/product/page");
  const Page = mod.default;
  const result = Page();
  if (result instanceof Promise) {
    return render(await result);
  }
  return render(result);
}

// ---------- /product 首页 smoke tests ----------
describe("/product index page", () => {
  it("renders without crashing", async () => {
    await renderProductPage();
  }, 30000);

  it("renders content with 产品中心", async () => {
    await renderProductPage();
    const body = document.body.textContent ?? "";
    expect(body).toContain("产品中心");
  }, 30000);

  it("includes at least one live brand reference", async () => {
    await renderProductPage();
    const vehicleMap = document.querySelector(
      '[data-testid="VehicleTopicMap"]',
    );
    expect(vehicleMap).not.toBeNull();
    expect(vehicleMap!.textContent ?? "").not.toBe("");
  }, 30000);

  it("includes at least one live service reference", async () => {
    await renderProductPage();
    const serviceMaps = document.querySelectorAll(
      '[data-testid="FilmServiceMap"], [data-testid="LightModMap"], [data-testid="PracticalAccessoryMap"]',
    );
    expect(serviceMaps.length).toBeGreaterThan(0);
  }, 30000);
});

// ---------- window-film 动态路由数据层测试 ----------
describe("window-film dynamic route data layer", () => {
  it("getAllWindowFilmPackageSlugsWithDetails returns 7 slugs", async () => {
    const { getAllWindowFilmPackageSlugsWithDetails } = await import(
      "@/lib/window-film-details"
    );
    const slugs = getAllWindowFilmPackageSlugsWithDetails();
    expect(slugs).toHaveLength(7);
  });

  it.each([
    "chunfen",
    "guyu",
    "xiaoman",
    "mangzhong",
    "bailu",
    "wanghong",
    "yangsheng",
  ])("slug %s resolves to a defined package", async (slug) => {
    const { getWindowFilmPackageWithDetails } = await import(
      "@/lib/window-film-details"
    );
    const pkg = getWindowFilmPackageWithDetails(slug);
    expect(pkg).toBeDefined();
    expect(pkg!.slug).toBe(slug);
    expect(pkg!.name).toBeDefined();
    expect(pkg!.positioning).toBeDefined();
  });

  it("invalid slug returns undefined", async () => {
    const { getWindowFilmPackageWithDetails } = await import(
      "@/lib/window-film-details"
    );
    const pkg = getWindowFilmPackageWithDetails("non-existent-package");
    expect(pkg).toBeUndefined();
  });
});
