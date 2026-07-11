import type { Store, Province, City } from "@/lib/store";
import { stores, provinces, cities, getStore } from "@/lib/store";

export interface StoreQuery {
  province?: string;
  city?: string;
  search?: string;
  level?: string | string[];
  limit?: number;
  sort?: "public_featured";
}

export function listStores(query: StoreQuery = {}): Store[] {
  let result = stores;

  if (query.province) {
    result = result.filter((s) => s.province === query.province);
  }
  if (query.city) {
    result = result.filter((s) => s.city === query.city);
  }
  if (query.level) {
    const levels = Array.isArray(query.level) ? query.level : [query.level];
    result = result.filter((s) => levels.includes(s.level ?? "flagship"));
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.cityLabel.toLowerCase().includes(q) ||
        s.provinceLabel.toLowerCase().includes(q) ||
        (s.district && s.district.toLowerCase().includes(q)) ||
        s.address.toLowerCase().includes(q) ||
        s.phone.includes(q),
    );
  }
  if (query.limit) {
    result = result.slice(0, query.limit);
  }
  return result;
}

export function findStore(id: string): Store | undefined {
  return getStore(id);
}

export function listProvinces(): Province[] {
  return provinces;
}

export function listCities(province?: string): City[] {
  if (province) {
    return cities.filter((c) => c.province === province);
  }
  return cities;
}

export function listStaticStoreParams(): Array<{ id: string }> {
  return stores.map((s) => ({ id: s.id }));
}

export function listStaticCityParams(provinceSlug: string): Array<{ slug: string; city: string }> {
  const provinceCities = cities.filter((c) => c.province === provinceSlug);
  return provinceCities.map((c) => ({ slug: provinceSlug, city: c.slug }));
}
