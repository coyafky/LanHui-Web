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
    it("returns only the confirmed Shunde Daliang store", () => {
      const result = listStores();
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "100001",
        name: "蓝辉轻改顺德大良店",
        province: "guangdong",
        city: "foshan",
      });
    });

    it("filters by province", () => {
      const result = listStores({ province: "guangdong" });
      expect(result).toHaveLength(1);
      expect(result.every((s) => s.province === "guangdong")).toBe(true);
    });

    it("filters by city", () => {
      const result = listStores({ city: "foshan" });
      expect(result).toHaveLength(1);
      expect(result.every((s) => s.city === "foshan")).toBe(true);
    });

    it("filters by province and city combined", () => {
      const result = listStores({ province: "guangdong", city: "foshan" });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("蓝辉轻改顺德大良店");
    });

    it("filters by search keyword", () => {
      const result = listStores({ search: "顺德" });
      expect(result).toHaveLength(1);
      expect(result.every((s) => s.cityLabel.includes("佛山"))).toBe(true);
    });

    it("filters by search on name", () => {
      const result = listStores({ search: "南京" });
      expect(result).toHaveLength(0);
    });

    it("limits results", () => {
      const result = listStores({ limit: 2 });
      expect(result).toHaveLength(1);
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
    it("returns all 31 mainland province-level regions", () => {
      const result = listProvinces();
      expect(result).toHaveLength(31);
      expect(result.map((p) => p.slug)).toContain("guangdong");
      expect(result.find((p) => p.slug === "guangdong")).toMatchObject({
        cityCount: 21,
        storeCount: 1,
      });
      expect(result.find((p) => p.slug === "jiangsu")?.storeCount).toBe(0);
    });
  });

  describe("listCities", () => {
    it("returns all 333 mainland prefecture-level regions", () => {
      const result = listCities();
      expect(result).toHaveLength(333);
    });

    it("filters by province", () => {
      const result = listCities("jiangsu");
      expect(result).toHaveLength(13);
      expect(result.map((c) => c.slug)).toContain("nanjing");
      expect(result.every((c) => c.storeCount === 0)).toBe(true);
    });

    it("returns empty for unknown province", () => {
      const result = listCities("unknown");
      expect(result).toHaveLength(0);
    });
  });

  describe("listStaticStoreParams", () => {
    it("returns only the confirmed store id param", () => {
      const result = listStaticStoreParams();
      expect(result).toEqual([{ id: "100001" }]);
    });
  });

  describe("listStaticCityParams", () => {
    it("returns city params for a province", () => {
      const result = listStaticCityParams("guangdong");
      expect(result).toHaveLength(21);
      expect(result).toContainEqual({ slug: "guangdong", city: "foshan" });
    });

    it("returns empty for unknown province", () => {
      const result = listStaticCityParams("unknown");
      expect(result).toHaveLength(0);
    });
  });
});
