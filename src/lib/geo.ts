/**
 * GEO 地理页面模块
 *
 * 为门店地理页面提供：
 * - 动态 SEO metadata 生成
 * - LocalBusiness JSON-LD 结构化数据
 * - BreadcrumbList JSON-LD
 * - canonical URL 生成
 */

import type { Metadata } from "next";
import type { Store } from "./store";
import { brand } from "./brand";

const SITE_URL = "https://lanhui.example.com";

/** 生成地理页面的 SEO metadata */
export function generateGeoMetadata(
  province: { slug: string; label: string },
  city?: { slug: string; label: string }
): Metadata {
  if (city) {
    return {
      title: `${brand.zh}${city.label}门店 | ${brand.zh}`,
      description: `${brand.zh}在${province.label}${city.label}的授权门店，提供电动踏板、轮毂升级、汽车窗膜、改色膜、隐形车衣等轻改装服务。`,
      keywords: `${brand.zh},${city.label},汽车轻改,电动踏板,轮毂升级,汽车贴膜`,
      alternates: {
        canonical: `${SITE_URL}/agent/${province.slug}/${city.slug}`,
      },
    };
  }

  return {
    title: `${brand.zh}${province.label}门店 | ${brand.zh}`,
    description: `${brand.zh}在${province.label}的授权门店网络，覆盖多个城市，提供专业新能源汽车轻改装服务。`,
    keywords: `${brand.zh},${province.label},汽车轻改,门店`,
    alternates: {
      canonical: `${SITE_URL}/agent/${province.slug}`,
    },
  };
}

/** 生成 LocalBusiness JSON-LD */
export function generateLocalBusinessSchema(store: Store) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/agent/store/${store.id}`,
    name: store.name,
    description: store.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address,
      addressLocality: store.cityLabel,
      addressRegion: store.provinceLabel,
      addressCountry: "CN",
    },
    ...(store.phone !== "联系方式待补充" && {
      telephone: store.phone,
    }),
    ...(store.businessHours !== "营业时间待确认" && {
      openingHours: store.businessHours,
    }),
    url: `${SITE_URL}/agent/store/${store.id}`,
    parentOrganization: {
      "@type": "Organization",
      name: brand.zh,
    },
  };
}

/** 生成 BreadcrumbList JSON-LD */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/** 获取 canonical URL */
export function getCanonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
