import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache revalidate (no-op in test)
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

// Helper: mock fetch with a JSON response
function mockFetchResponse(body: unknown, init?: { ok?: boolean; status?: number }) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => body,
  } as Response);
}

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("mapApiStore (via getStores fallback path)", () => {
  it("只使用 imagePath（imageUrl 字段已弃用）", async () => {
    mockFetchResponse({
      success: true,
      data: [{
        id: "s1", name: "测试店",
        provinceSlug: "guangdong", provinceLabel: "广东",
        citySlug: "foshan", cityLabel: "佛山",
        address: "x", phone: "1", phoneTel: "tel:1",
        imagePath: "/images/stores/s1.webp",
        imageUrl: "https://legacy.example/x.jpg",
        isActive: true,
      }],
    });
    const { getStores } = await import("./data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBe("/images/stores/s1.webp");
    expect(stores[0].isActive).toBe(true);
  });

  it("imagePath=null 时 image=undefined（不再回退 imageUrl，避免外部 URL 被 next/image 拒绝）", async () => {
    mockFetchResponse({
      success: true,
      data: [{
        id: "s1", name: "测试店",
        provinceSlug: "guangdong", provinceLabel: "广东",
        citySlug: "foshan", cityLabel: "佛山",
        address: "x", phone: "1", phoneTel: "tel:1",
        imagePath: null,
        imageUrl: "https://legacy.example/x.jpg",
        isActive: true,
      }],
    });
    const { getStores } = await import("./data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBeUndefined();
  });

  it("两者都为 null → image = undefined", async () => {
    mockFetchResponse({
      success: true,
      data: [{
        id: "s1", name: "测试店",
        provinceSlug: "guangdong", provinceLabel: "广东",
        citySlug: "foshan", cityLabel: "佛山",
        address: "x", phone: "1", phoneTel: "tel:1",
        imagePath: null, imageUrl: null,
        isActive: true,
      }],
    });
    const { getStores } = await import("./data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].image).toBeUndefined();
  });

  it("isActive 字段缺失 → 默认 true", async () => {
    mockFetchResponse({
      success: true,
      data: [{
        id: "s1", name: "测试店",
        provinceSlug: "guangdong", provinceLabel: "广东",
        citySlug: "foshan", cityLabel: "佛山",
        address: "x", phone: "1", phoneTel: "tel:1",
        // isActive 故意省略
      }],
    });
    const { getStores } = await import("./data");
    const stores = await getStores({ limit: 1 });
    expect(stores[0].isActive).toBe(true);
  });

  it("sort=public_featured 会透传到 /api/stores 查询参数", async () => {
    mockFetchResponse({ success: true, data: [] });
    const { getStores } = await import("./data");
    await getStores({ limit: 4, sort: "public_featured" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("sort=public_featured"),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("search 参数透传到 /api/stores?search=xxx", async () => {
    mockFetchResponse({ success: true, data: [] });
    const { getStores } = await import("./data");
    await getStores({ search: "佛山" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("search=%E4%BD%9B%E5%B1%B1"),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("level 单值透传到 /api/stores?level=flagship", async () => {
    mockFetchResponse({ success: true, data: [] });
    const { getStores } = await import("./data");
    await getStores({ level: "flagship" });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("level=flagship"),
      expect.objectContaining({ next: { revalidate: 3600 } }),
    );
  });

  it("level 数组透传到 /api/stores?level=flagship&level=premium", async () => {
    mockFetchResponse({ success: true, data: [] });
    const { getStores } = await import("./data");
    await getStores({ level: ["flagship", "premium"] });
    const callUrl = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;
    expect(callUrl).toContain("level=flagship");
    expect(callUrl).toContain("level=premium");
  });

  it("static fallback search 匹配 name/cityLabel/address", async () => {
    mockFetchResponse(null, { ok: false, status: 500 });
    const { getStores } = await import("./data");
    const stores = await getStores({ search: "顺德" });
    expect(stores.length).toBeGreaterThan(0);
    stores.forEach((s) => {
      const matched =
        s.name.includes("顺德") ||
        s.cityLabel.includes("顺德") ||
        s.provinceLabel.includes("顺德") ||
        s.district.includes("顺德") ||
        s.address.includes("顺德") ||
        s.phone.includes("顺德");
      expect(matched).toBe(true);
    });
  });

  it("static fallback level 过滤旗舰店", async () => {
    mockFetchResponse(null, { ok: false, status: 500 });
    const { getStores } = await import("./data");
    const stores = await getStores({ level: "flagship" });
    expect(stores.length).toBeGreaterThan(0);
    stores.forEach((s) => {
      expect(s.level ?? "flagship").toBe("flagship");
    });
  });
});
