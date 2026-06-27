import type { MetadataRoute } from "next";
import { getAllProductSlugs } from "@/lib/products";
import {
  getAllProvinceSlugs,
  getAllCitySlugs,
  getAllStoreIds,
  getProvinces,
  getAllArticleSlugs,
} from "@/lib/data";

const SITE_URL = "https://lanhui.example.com";

const LAST_MOD = new Date("2026-06-01");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/product`,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/agent`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/brand`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/brand/certifications`,
      lastModified: LAST_MOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/brand/history`,
      lastModified: LAST_MOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: LAST_MOD,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: LAST_MOD,
      changeFrequency: "yearly",
      priority: 0.6,
    },
  ];

  // Product detail pages (still from static data)
  const productRoutes: MetadataRoute.Sitemap = getAllProductSlugs().map(
    (slug) => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  // Province pages (from API with fallback)
  let provinceSlugs: string[] = [];
  let provincesData: { slug: string }[] = [];
  try {
    provinceSlugs = await getAllProvinceSlugs();
    provincesData = await getProvinces();
  } catch {
    // fallback already handled in data.ts
  }

  const provinceRoutes: MetadataRoute.Sitemap = provinceSlugs.map((slug) => ({
    url: `${SITE_URL}/agent/${slug}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // City pages
  const cityRoutes: MetadataRoute.Sitemap = [];
  for (const p of provincesData) {
    try {
      const citySlugs = await getAllCitySlugs(p.slug);
      for (const city of citySlugs) {
        cityRoutes.push({
          url: `${SITE_URL}/agent/${p.slug}/${city}`,
          lastModified: LAST_MOD,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        });
      }
    } catch {
      // skip on error
    }
  }

  // Store detail pages (from API with fallback)
  let storeIds: string[] = [];
  try {
    storeIds = await getAllStoreIds();
  } catch {
    // fallback already handled in data.ts
  }

  const storeRoutes: MetadataRoute.Sitemap = storeIds.map((id) => ({
    url: `${SITE_URL}/agent/store/${id}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // News detail pages (from API with fallback)
  let articleSlugs: string[] = [];
  try {
    articleSlugs = await getAllArticleSlugs();
  } catch {
    // fallback already handled in data.ts
  }

  const newsRoutes: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: `${SITE_URL}/news/${slug}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  // 问界车型专题子路由（wenjie M6 / M7 / M8 二级页）
  const wenjieModelRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/product/wenjie/m6`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/product/wenjie/m7`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/product/wenjie/m8`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // 特斯拉系列单级专题页（Tesla L1）
  const teslaTopicRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/product/tesla`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // 小鹏 GX 单车型专题页（XPENG GX L2）
  const xpengGxModelRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/product/xpeng/gx`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  // 蔚来 ES8 单车型专题页（NIO ES8 L2）
  const nioEs8ModelRoute: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/product/nio/es8`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
  ];

  return [
    ...staticRoutes,
    ...productRoutes,
    ...provinceRoutes,
    ...cityRoutes,
    ...storeRoutes,
    ...newsRoutes,
    ...wenjieModelRoutes,
    ...teslaTopicRoutes,
    ...xpengGxModelRoute,
    ...nioEs8ModelRoute,
  ];
}
