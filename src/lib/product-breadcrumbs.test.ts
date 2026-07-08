import { describe, expect, it } from "vitest";
import {
  getProductBreadcrumbs,
  getProductBreadcrumbSchema,
} from "./product-breadcrumbs";

describe("getProductBreadcrumbs", () => {
  it("produces 2 items for /product root", () => {
    const items = getProductBreadcrumbs("/product");
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({ label: "首页", href: "/" });
    expect(items[1]).toEqual({ label: "产品中心" }); // no href = last item
  });

  it("resolves service slug (ppf -> 隐形车衣)", () => {
    const items = getProductBreadcrumbs("/product/ppf");
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ label: "首页", href: "/" });
    expect(items[1]).toEqual({ label: "产品中心", href: "/product" });
    expect(items[2]).toEqual({ label: "隐形车衣" }); // last, no href
  });

  it("resolves brand slug (xiaomi -> 小米轻改方案)", () => {
    const items = getProductBreadcrumbs("/product/xiaomi");
    expect(items).toHaveLength(3);
    expect(items[0]).toEqual({ label: "首页", href: "/" });
    expect(items[1]).toEqual({ label: "产品中心", href: "/product" });
    expect(items[2]).toEqual({ label: "小米轻改方案" });
  });

  it("resolves brand + model (xiaomi/su7)", () => {
    const items = getProductBreadcrumbs("/product/xiaomi/su7");
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ label: "首页", href: "/" });
    expect(items[1]).toEqual({ label: "产品中心", href: "/product" });
    expect(items[2]).toEqual({
      label: "小米轻改方案",
      href: "/product/xiaomi",
    });
    expect(items[3]).toEqual({ label: "小米 SU7 专属升级方案" });
  });

  it("resolves window-film package", () => {
    const items = getProductBreadcrumbs("/product/window-film/chunfen");
    expect(items).toHaveLength(4);
    expect(items[0]).toEqual({ label: "首页", href: "/" });
    expect(items[1]).toEqual({ label: "产品中心", href: "/product" });
    expect(items[2]).toEqual({
      label: "汽车窗膜",
      href: "/product/window-film",
    });
    expect(items[3]).toEqual({ label: "春分套餐" });
  });

  it("falls back to title-cased label for unknown slug", () => {
    const items = getProductBreadcrumbs("/product/unknown-thing");
    expect(items).toHaveLength(3);
    expect(items[2]).toEqual({ label: "Unknown Thing" });
  });
});

describe("getProductBreadcrumbSchema", () => {
  it("does not crash on empty path", () => {
    // getProductBreadcrumbs always returns ≥2 items for any real path,
    // the <2 guard is defensive — verify it doesn't throw
    expect(() => getProductBreadcrumbSchema("/")).not.toThrow();
  });

  it("returns valid schema for /product", () => {
    const schema = getProductBreadcrumbSchema("/product");
    expect(schema).not.toBeNull();
    expect(schema).toHaveProperty("@context", "https://schema.org");
    expect(schema).toHaveProperty("@type", "BreadcrumbList");
    const list = (schema as Record<string, unknown>).itemListElement as Array<Record<string, unknown>>;
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ position: 1, name: "首页" });
    expect(list[1]).toMatchObject({ position: 2, name: "产品中心" });
  });

  it("uses pathname as url for last item without href", () => {
    const schema = getProductBreadcrumbSchema("/product/xiaomi");
    const list = (schema as Record<string, unknown>).itemListElement as Array<Record<string, unknown>>;
    // Last item (产品中心) has no href, so url should use pathname
    const lastItem = list[list.length - 1];
    expect(lastItem).toMatchObject({
      name: "小米轻改方案",
    });
    expect((lastItem as Record<string, unknown>).item as string).toContain(
      "/product/xiaomi"
    );
  });
});
