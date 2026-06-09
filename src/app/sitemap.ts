import type { MetadataRoute } from "next";
import { products, getAllProductSlugs } from "@/lib/products";
import {
  getAllProvinceSlugs,
  getAllCitySlugs,
  provinces,
  stores,
  getAllStoreIds,
} from "@/lib/store";
import { getAllNewsSlugs } from "@/lib/news";

const SITE_URL = "https://lanhui.example.com";

// Phase 1: all dates are "2026" / static. Replace with real lastModified after Phase 2.
const LAST_MOD = new Date("2026-06-01");

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Product detail pages
  const productRoutes: MetadataRoute.Sitemap = getAllProductSlugs().map(
    (slug) => ({
      url: `${SITE_URL}/product/${slug}`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  // Province pages
  const provinceRoutes: MetadataRoute.Sitemap = getAllProvinceSlugs().map(
    (slug) => ({
      url: `${SITE_URL}/agent/${slug}`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })
  );

  // City pages
  const cityRoutes: MetadataRoute.Sitemap = provinces.flatMap((p) =>
    getAllCitySlugs(p.slug).map((city) => ({
      url: `${SITE_URL}/agent/${p.slug}/${city}`,
      lastModified: LAST_MOD,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  // Store detail pages
  const storeRoutes: MetadataRoute.Sitemap = getAllStoreIds().map((id) => ({
    url: `${SITE_URL}/agent/store/${id}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // News detail pages
  const newsRoutes: MetadataRoute.Sitemap = getAllNewsSlugs().map((slug) => ({
    url: `${SITE_URL}/news/${slug}`,
    lastModified: LAST_MOD,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...provinceRoutes,
    ...cityRoutes,
    ...storeRoutes,
    ...newsRoutes,
  ];
}

// Suppress unused warning for products re-export
void products;
void stores;
