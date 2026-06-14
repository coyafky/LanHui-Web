/**
 * 前台数据获取层
 *
 * 优先从 API 获取数据（支持 ISR），API 不可用时降级到静态数据。
 * 项目未启用 cacheComponents，使用 fetch + next.revalidate 实现 ISR。
 */

import type { Store, Province, City } from "@/lib/store";
import type { NewsItem } from "@/lib/news";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// ── Helper：将 API Store 映射为前台 Store 类型 ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiStore(raw: any): Store {
  return {
    id: raw.id ?? raw.slug,
    name: raw.name,
    province: raw.provinceSlug,
    provinceLabel: raw.provinceLabel,
    city: raw.citySlug,
    cityLabel: raw.cityLabel,
    district: raw.district ?? "",
    address: raw.address,
    phone: raw.phone,
    phoneTel: raw.phoneTel,
    businessHours: raw.businessHours ?? "",
    description: raw.description ?? "",
    image: raw.imageUrl,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiProvince(raw: any): Province {
  return {
    slug: raw.slug,
    label: raw.label,
    cityCount: raw.cityCount ?? raw._count?.cities ?? 0,
    storeCount: raw.storeCount ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiCity(raw: any): City {
  return {
    slug: raw.slug,
    province: raw.provinceSlug,
    label: raw.label,
    storeCount: raw.storeCount ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiArticle(raw: any): NewsItem {
  return {
    slug: raw.slug,
    title: raw.title,
    date: raw.publishedAt
      ? new Date(raw.publishedAt).toISOString().slice(0, 10)
      : raw.createdAt
        ? new Date(raw.createdAt).getFullYear().toString()
        : "2026",
    category: raw.category ?? "品牌动态",
    summary: raw.excerpt ?? raw.content?.slice(0, 120) ?? "",
    content: raw.content ?? "",
  };
}

// ── Stores ──

export async function getStores(params?: {
  province?: string;
  city?: string;
  limit?: number;
}): Promise<Store[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.province) searchParams.set("province", params.province);
    if (params?.city) searchParams.set("city", params.city);
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const res = await fetch(`${API_BASE}/api/stores?${searchParams}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map(mapApiStore);
  } catch {
    // Fallback to static data
    const { stores } = await import("@/lib/store");
    let result = stores;
    if (params?.province) result = result.filter((s) => s.province === params.province);
    if (params?.city) result = result.filter((s) => s.city === params.city);
    if (params?.limit) result = result.slice(0, params.limit);
    return result;
  }
}

export async function getStoreById(id: string): Promise<Store | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stores/${id}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return mapApiStore(json.data);
  } catch {
    const { getStore } = await import("@/lib/store");
    return getStore(id) ?? null;
  }
}

// ── Provinces ──

export async function getProvinces(): Promise<Province[]> {
  try {
    const res = await fetch(`${API_BASE}/api/provinces`, {
      next: { revalidate: 604800 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map(mapApiProvince);
  } catch {
    const { provinces } = await import("@/lib/store");
    return provinces;
  }
}

export async function getProvinceBySlug(slug: string): Promise<Province | null> {
  const list = await getProvinces();
  return list.find((p) => p.slug === slug) ?? null;
}

// ── Cities ──

export async function getCities(province?: string): Promise<City[]> {
  try {
    const url = province
      ? `${API_BASE}/api/cities?province=${province}`
      : `${API_BASE}/api/cities`;
    const res = await fetch(url, {
      next: { revalidate: 604800 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.data ?? []).map(mapApiCity);
  } catch {
    const { cities } = await import("@/lib/store");
    if (province) return cities.filter((c) => c.province === province);
    return cities;
  }
}

export async function getCityBySlug(
  provinceSlug: string,
  citySlug: string,
): Promise<City | null> {
  const list = await getCities(provinceSlug);
  return list.find((c) => c.slug === citySlug) ?? null;
}

// ── Articles / News ──

export type ArticlesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function getArticles(params?: {
  status?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{ articles: NewsItem[]; pagination: ArticlesPagination }> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  try {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    searchParams.set("page", String(page));
    searchParams.set("limit", String(limit));

    const res = await fetch(`${API_BASE}/api/articles?${searchParams}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const articles = (json.data ?? []).map(mapApiArticle);
    const pagination: ArticlesPagination = json.pagination ?? {
      page,
      limit,
      total: articles.length,
      totalPages: 1,
    };
    return { articles, pagination };
  } catch {
    const { newsItems } = await import("@/lib/news");
    let result = [...newsItems];
    if (params?.category) result = result.filter((n) => n.category === params.category);
    const skip = (page - 1) * limit;
    const paged = result.slice(skip, skip + limit);
    return {
      articles: paged.map(mapApiArticle),
      pagination: {
        page,
        limit,
        total: result.length,
        totalPages: Math.max(1, Math.ceil(result.length / limit)),
      },
    };
  }
}

export async function getArticleBySlug(
  slug: string,
): Promise<NewsItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/articles/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return mapApiArticle(json.data);
  } catch {
    const { newsItems } = await import("@/lib/news");
    return newsItems.find((n) => n.slug === slug) ?? null;
  }
}

// ── generateStaticParams helpers (with fallback) ──

export async function getAllProvinceSlugs(): Promise<string[]> {
  const list = await getProvinces();
  return list.map((p) => p.slug);
}

export async function getAllCitySlugs(province: string): Promise<string[]> {
  const list = await getCities(province);
  return list.map((c) => c.slug);
}

export async function getAllStoreIds(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/stores?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).map((s: any) => (s.id ?? s.slug) as string);
  } catch {
    const { stores } = await import("@/lib/store");
    return stores.map((s) => s.id);
  }
}

export async function getAllArticleSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/articles?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (json.data ?? []).map((a: any) => a.slug as string);
  } catch {
    const { newsItems } = await import("@/lib/news");
    return newsItems.map((n) => n.slug);
  }
}
