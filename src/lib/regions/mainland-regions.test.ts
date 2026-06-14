import { describe, it, expect } from "vitest";
import {
  MAINLAND_PROVINCES,
  MAINLAND_CITIES,
  type ProvinceType,
  type CityType,
} from "./mainland-regions";

const VALID_PROVINCE_TYPES: ProvinceType[] = [
  "municipality",
  "province",
  "autonomous_region",
];
const VALID_CITY_TYPES: CityType[] = [
  "municipality",
  "prefecture_city",
  "autonomous_prefecture",
  "prefecture",
  "league",
];

describe("mainland-regions", () => {
  describe("province data", () => {
    it("contains exactly 31 provinces (4 municipalities + 22 provinces + 5 autonomous regions)", () => {
      expect(MAINLAND_PROVINCES).toHaveLength(31);
      const municipalities = MAINLAND_PROVINCES.filter(
        (p) => p.type === "municipality",
      );
      const provinces = MAINLAND_PROVINCES.filter(
        (p) => p.type === "province",
      );
      const autonomous = MAINLAND_PROVINCES.filter(
        (p) => p.type === "autonomous_region",
      );
      expect(municipalities).toHaveLength(4);
      expect(provinces).toHaveLength(22);
      expect(autonomous).toHaveLength(5);
    });

    it("does not include Taiwan", () => {
      const taiwan = MAINLAND_PROVINCES.find(
        (p) => p.slug === "taiwan" || p.label === "台湾省",
      );
      expect(taiwan).toBeUndefined();
    });

    it("does not include Hong Kong", () => {
      const hk = MAINLAND_PROVINCES.find(
        (p) => p.slug === "hongkong" || p.label.includes("香港"),
      );
      expect(hk).toBeUndefined();
    });

    it("does not include Macao", () => {
      const macao = MAINLAND_PROVINCES.find(
        (p) => p.slug === "macao" || p.label.includes("澳门"),
      );
      expect(macao).toBeUndefined();
    });

    it("has unique codes across all provinces", () => {
      const codes = MAINLAND_PROVINCES.map((p) => p.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it("has unique slugs across all provinces", () => {
      const slugs = MAINLAND_PROVINCES.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("has unique order values", () => {
      const orders = MAINLAND_PROVINCES.map((p) => p.order);
      expect(new Set(orders).size).toBe(orders.length);
    });

    it("uses only valid province type values", () => {
      for (const p of MAINLAND_PROVINCES) {
        expect(VALID_PROVINCE_TYPES).toContain(p.type);
      }
    });

    it("uses 6-digit code in correct format (XX0000)", () => {
      for (const p of MAINLAND_PROVINCES) {
        expect(p.code).toMatch(/^\d{6}$/);
        expect(p.code.endsWith("0000")).toBe(true);
      }
    });
  });

  describe("city data", () => {
    it("has unique codes across all cities", () => {
      const codes = MAINLAND_CITIES.map((c) => c.code);
      expect(new Set(codes).size).toBe(codes.length);
    });

    it("has unique slugs across all cities", () => {
      const slugs = MAINLAND_CITIES.map((c) => c.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    });

    it("every city provinceSlug points to an existing province", () => {
      const provinceSlugs = new Set(MAINLAND_PROVINCES.map((p) => p.slug));
      for (const c of MAINLAND_CITIES) {
        expect(provinceSlugs.has(c.provinceSlug)).toBe(true);
      }
    });

    it("uses only valid city type values", () => {
      for (const c of MAINLAND_CITIES) {
        expect(VALID_CITY_TYPES).toContain(c.type);
      }
    });

    it("uses 6-digit code in correct format (XXYY00)", () => {
      for (const c of MAINLAND_CITIES) {
        expect(c.code).toMatch(/^\d{6}$/);
      }
    });

    it("municipality cities share slug with their province", () => {
      const municipalityCities = MAINLAND_CITIES.filter(
        (c) => c.type === "municipality",
      );
      expect(municipalityCities).toHaveLength(4);
      for (const c of municipalityCities) {
        expect(c.slug).toBe(c.provinceSlug);
      }
      // Verify the 4 expected slugs
      const slugs = municipalityCities.map((c) => c.slug).sort();
      expect(slugs).toEqual(["beijing", "chongqing", "shanghai", "tianjin"]);
    });

    it("does not contain any Hong Kong, Macao, or Taiwan cities", () => {
      const provinceSlugs = new Set(MAINLAND_PROVINCES.map((p) => p.slug));
      for (const c of MAINLAND_CITIES) {
        expect(provinceSlugs.has(c.provinceSlug)).toBe(true);
        expect(["hongkong", "macao", "taiwan"]).not.toContain(c.provinceSlug);
      }
    });
  });

  describe("province / city relationship", () => {
    it("each non-municipality province has at least one city", () => {
      for (const p of MAINLAND_PROVINCES) {
        const cities = MAINLAND_CITIES.filter(
          (c) => c.provinceSlug === p.slug,
        );
        expect(cities.length).toBeGreaterThan(0);
      }
    });
  });
});
