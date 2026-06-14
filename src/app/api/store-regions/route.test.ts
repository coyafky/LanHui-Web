import { describe, it, expect, beforeEach, vi } from "vitest";

const mockStoreRegions = vi.hoisted(() => [
  { slug: "hebei", label: "河北省", cities: [{ slug: "shijiazhuang", label: "石家庄市", isCapital: true }] },
  { slug: "guangdong", label: "广东省", cities: [
    { slug: "guangzhou", label: "广州市", isCapital: true },
    { slug: "foshan", label: "佛山市" },
  ] },
]);

vi.mock("@/lib/store-regions", () => ({
  STORE_REGIONS: mockStoreRegions,
}));

beforeEach(() => {
  vi.resetModules();
});

async function loadGet() {
  const mod = await import("./route");
  return mod.GET;
}

describe("GET /api/store-regions", () => {
  it("返回 success + data 数组", async () => {
    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{ slug: string; label: string; cities: unknown[] }>;
    };
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it("data 中每个省份含 slug/label/cities", async () => {
    const GET = await loadGet();
    const res = await GET();
    const json = (await res.json()) as {
      data: Array<{ slug: string; label: string; cities: unknown[] }>;
    };
    for (const r of json.data) {
      expect(typeof r.slug).toBe("string");
      expect(typeof r.label).toBe("string");
      expect(Array.isArray(r.cities)).toBe(true);
    }
  });

  it("包含河北（含省会） + 广东（含省会 + 经济强市）", async () => {
    const GET = await loadGet();
    const res = await GET();
    const json = (await res.json()) as {
      data: Array<{ slug: string; label: string; cities: { slug: string; label: string; isCapital?: boolean }[] }>;
    };
    const hebei = json.data.find((r) => r.slug === "hebei");
    expect(hebei?.label).toBe("河北省");
    expect(hebei?.cities.some((c) => c.isCapital === true)).toBe(true);

    const gd = json.data.find((r) => r.slug === "guangdong");
    expect(gd?.cities.length).toBeGreaterThanOrEqual(2);
  });
});