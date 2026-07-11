import { describe, it, expect } from "vitest";
import {
  listStores,
  findStore,
  listProvinces,
  listCities,
  listStaticStoreParams,
  listStaticCityParams,
} from "./store-query";

describe("store-query", () => {
  describe("listStores", () => {
    it("returns all stores when no filter", () => {
      const result = listStores();
      expect(result.length).toBe(7);
    });

    it("filters by province", () => {
      const result = listStores({ province: "guangdong" });
      expect(result).toHaveLength(4);
      expect(result.every((s) => s.province === "guangdong")).toBe(true);
    });

    it("filters by city", () => {
      const result = listStores({ city: "foshan" });
      expect(result).toHaveLength(4);
      expect(result.every((s) => s.city === "foshan")).toBe(true);
    });

    it("filters by province and city combined", () => {
      const result = listStores({ province: "jiangsu", city: "nanjing" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("蓝辉轻改南京江宁店");
    });

    it("filters by search keyword", () => {
      const result = listStores({ search: "顺德" });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every((s) => s.cityLabel.includes("佛山"))).toBe(true);
    });

    it("filters by search on name", () => {
      const result = listStores({ search: "南京" });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("100004");
    });

    it("limits results", () => {
      const result = listStores({ limit: 2 });
      expect(result).toHaveLength(2);
    });

    it("filters by level", () => {
      const flagships = listStores({ level: "flagship" });
      expect(flagships.length).toBeGreaterThan(0);
      expect(flagships.every((s) => (s.level ?? "flagship") === "flagship")).toBe(true);
    });

    it("returns empty for no-match search", () => {
      const result = listStores({ search: "zzz-no-match-zzz" });
      expect(result).toHaveLength(0);
    });
  });

  describe("findStore", () => {
    it("finds store by id", () => {
      const store = findStore("100001");
      expect(store).toBeDefined();
      expect(store!.name).toBe("蓝辉轻改顺德大良店");
    });

    it("returns undefined for unknown id", () => {
      const store = findStore("999999");
      expect(store).toBeUndefined();
    });
  });

  describe("listProvinces", () => {
    it("returns all provinces", () => {
      const result = listProvinces();
      expect(result.length).toBe(3);
      expect(result.map((p) => p.slug)).toContain("guangdong");
    });
  });

  describe("listCities", () => {
    it("returns all cities when no filter", () => {
      const result = listCities();
      expect(result.length).toBe(4);
    });

    it("filters by province", () => {
      const result = listCities("jiangsu");
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.slug)).toEqual(["nanjing", "suzhou"]);
    });

    it("returns empty for unknown province", () => {
      const result = listCities("unknown");
      expect(result).toHaveLength(0);
    });
  });

  describe("listStaticStoreParams", () => {
    it("returns all store id params", () => {
      const result = listStaticStoreParams();
      expect(result).toHaveLength(7);
      expect(result[0]).toHaveProperty("id");
    });
  });

  describe("listStaticCityParams", () => {
    it("returns city params for a province", () => {
      const result = listStaticCityParams("guangdong");
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ slug: "guangdong", city: "foshan" });
    });

    it("returns empty for unknown province", () => {
      const result = listStaticCityParams("unknown");
      expect(result).toHaveLength(0);
    });
  });
});
