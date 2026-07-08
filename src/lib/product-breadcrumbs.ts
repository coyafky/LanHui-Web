import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import {
  getBrandRoute,
  getModelRoute,
  getServiceRoute,
} from "@/lib/product-routes";
import { getWindowFilmPackage } from "@/lib/products";
import { generateBreadcrumbSchema } from "@/lib/geo";

/**
 * 将 pathname 末段 slug 转为可读标签（fallback）。
 */
function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * 根据 /product 下 pathname 生成面包屑数据。
 *
 * 映射规则（详见 PRD）:
 *   /product                                  → 首页 + 产品中心
 *   /product/{serviceSlug}                    → ... + service.title
 *   /product/{brandSlug}                      → ... + brand.title
 *   /product/{brandSlug}/{modelSlug}          → ... + brand.title + model.title
 *   /product/window-film/{packageSlug}        → ... + "汽车窗膜" + package.name
 *   其他                                      → ... + slug 转标题
 */
export function getProductBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  // 总是从首页开始
  const items: BreadcrumbItem[] = [{ label: "首页", href: "/" }];

  // /product 根（仅首页 + 产品中心）
  if (segments.length === 1 && segments[0] === "product") {
    items.push({ label: "产品中心" });
    return items;
  }

  // 非根路径：产品中心为可点击链接
  items.push({ label: "产品中心", href: "/product" });

  // 只剩第一段（/product/xxx）
  if (segments.length === 2) {
    const slug = segments[1];

    const brand = getBrandRoute(slug);
    if (brand) {
      items.push({ label: brand.title });
      return items;
    }

    const service = getServiceRoute(slug);
    if (service) {
      items.push({ label: service.title });
      return items;
    }

    items.push({ label: slugToLabel(slug) });
    return items;
  }

  // 两段及以上（/product/xxx/yyy ...）
  if (segments.length >= 3) {
    const firstSlug = segments[1];
    const secondSlug = segments[2];

    // 先试品牌 + 车型
    const brand = getBrandRoute(firstSlug);
    if (brand) {
      items.push({ label: brand.title, href: brand.canonicalPath });

      const model = getModelRoute(firstSlug, secondSlug);
      if (model) {
        items.push({ label: model.title });
      } else if (firstSlug === "window-film") {
        // 窗膜套餐
        const pkg = getWindowFilmPackage(secondSlug);
        items.push({ label: pkg ? pkg.name : slugToLabel(secondSlug) });
      } else {
        items.push({ label: slugToLabel(secondSlug) });
      }
      return items;
    }

    // 试服务 + 子路径
    const service = getServiceRoute(firstSlug);
    if (service) {
      items.push({ label: service.title, href: service.canonicalPath });

      if (firstSlug === "window-film") {
        const pkg = getWindowFilmPackage(secondSlug);
        items.push({ label: pkg ? pkg.name : slugToLabel(secondSlug) });
      } else {
        items.push({ label: slugToLabel(secondSlug) });
      }
      return items;
    }

    // 完全未知
    items.push({ label: slugToLabel(firstSlug) });
    items.push({ label: slugToLabel(secondSlug) });
    return items;
  }

  return items;
}

/**
 * 根据 /product 下 pathname 生成 BreadcrumbList JSON-LD。
 * 不足 2 项时返回 null。
 */
export function getProductBreadcrumbSchema(
  pathname: string
): object | null {
  const items = getProductBreadcrumbs(pathname);
  if (items.length < 2) return null;

  const schemaItems = items.map((item) => ({
    name: item.label,
    url: item.href ?? pathname,
  }));

  return generateBreadcrumbSchema(schemaItems);
}
