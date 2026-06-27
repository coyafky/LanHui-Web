import { describe, expect, it } from "vitest";
import {
  ALL_BRANDS, ALL_MODELS, ALL_SERVICES, ALL_LEGACY_ALIASES,
  getBrandRoute, getModelRoute, getServiceRoute, getCanonicalFor,
  getModelsByBrand, getLiveBrands, getLiveServices,
} from "./product-routes";

describe("product-routes registry", () => {
  it("contains exactly 12 brands", () => {
    expect(ALL_BRANDS).toHaveLength(12);
  });

  it("contains exactly 16 models", () => {
    expect(ALL_MODELS).toHaveLength(16);
  });

  it("contains exactly 10 services (6 P0 live + 1 P1 live + 3 P1 planned)", () => {
    expect(ALL_SERVICES).toHaveLength(10);
    expect(ALL_SERVICES.filter((s) => s.status === "live")).toHaveLength(7);
    expect(ALL_SERVICES.filter((s) => s.status === "planned")).toHaveLength(3);
  });

  it("all 14 legacy aliases are mapped", () => {
    expect(ALL_LEGACY_ALIASES).toHaveLength(14);
  });

  it("every model's parent brand is registered", () => {
    for (const m of ALL_MODELS) {
      expect(getBrandRoute(m.brandSlug), `model ${m.brandSlug}/${m.modelSlug} parent missing`).toBeDefined();
    }
  });

  it("canonical paths are unique across all routes", () => {
    const paths = [
      ...ALL_BRANDS.map((b) => b.canonicalPath),
      ...ALL_MODELS.map((m) => m.canonicalPath),
      ...ALL_SERVICES.map((s) => s.canonicalPath),
    ];
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("every legacy alias resolves via getCanonicalFor()", () => {
    for (const { from, to } of ALL_LEGACY_ALIASES) {
      expect(getCanonicalFor(from)).toBe(to);
    }
  });

  it("getModelRoute() finds known models", () => {
    expect(getModelRoute("wenjie", "m8")?.modelName).toBe("问界 M8");
    expect(getModelRoute("xiaomi", "yu7")?.modelName).toBe("小米 YU7");
  });

  it("getServiceRoute() finds known services", () => {
    expect(getServiceRoute("ppf")?.group).toBe("film");
    expect(getServiceRoute("business-comfort")?.status).toBe("planned");
  });

  it("getModelsByBrand() returns models for a brand", () => {
    const wenjieModels = getModelsByBrand("wenjie");
    expect(wenjieModels.map((m) => m.modelSlug).sort()).toEqual(["m6", "m7", "m8"]);
  });

  it("getLiveBrands() returns 7 brands (wenjie, xiaomi, zeekr, tesla, xpeng, nio, li-auto)", () => {
    expect(getLiveBrands().map((b) => b.brandSlug).sort()).toEqual(["li-auto", "nio", "tesla", "wenjie", "xiaomi", "xpeng", "zeekr"]);
  });

  it("legacy aliases do not collide with canonical paths", () => {
    const canonicals = new Set([
      ...ALL_BRANDS.map((b) => b.canonicalPath),
      ...ALL_MODELS.map((m) => m.canonicalPath),
      ...ALL_SERVICES.map((s) => s.canonicalPath),
    ]);
    for (const { from } of ALL_LEGACY_ALIASES) {
      expect(canonicals.has(from), `legacy ${from} collides with a canonical`).toBe(false);
    }
  });
});
