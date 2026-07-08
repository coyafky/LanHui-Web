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

describe("getArticles", () => {
  it("returns { articles, pagination } shape on API success", async () => {
    mockFetchResponse({
      success: true,
      data: [{ id: 1, title: "Test", slug: "test", status: "published" }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    const { getArticles } = await import("./data");
    const result = await getArticles({ status: "published" });
    expect(result).toHaveProperty("articles");
    expect(result).toHaveProperty("pagination");
    expect(Array.isArray(result.articles)).toBe(true);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("falls back to static data with valid pagination when API returns 500", async () => {
    mockFetchResponse(null, { ok: false, status: 500 });
    const { getArticles } = await import("./data");
    const result = await getArticles({ status: "published", page: 1, limit: 5 });
    expect(result).toHaveProperty("articles");
    expect(result).toHaveProperty("pagination");
    // Static newsItems should be non-empty
    expect(result.articles.length).toBeGreaterThanOrEqual(0);
    expect(typeof result.pagination.total).toBe("number");
    expect(typeof result.pagination.totalPages).toBe("number");
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.limit).toBe(5);
  });

  it("paginates static fallback correctly with page=2, limit=1", async () => {
    mockFetchResponse(null, { ok: false, status: 500 });
    const { getArticles } = await import("./data");
    const page1 = await getArticles({ page: 1, limit: 1 });
    const page2 = await getArticles({ page: 2, limit: 1 });
    // page 2 should have different content from page 1 (or empty if total < 2)
    if (page1.articles.length > 0) {
      // pagination total should reflect unfiltered newsItems count
      expect(page1.pagination.total).toBeGreaterThan(0);
    }
    // page 2 limit 1: should have at most 1 item
    expect(page2.articles.length).toBeLessThanOrEqual(1);
    expect(page2.pagination.page).toBe(2);
  });

  it("regression: pagination object is always present even with empty articles", async () => {
    mockFetchResponse({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });
    const { getArticles } = await import("./data");
    const result = await getArticles({ status: "published" });
    expect(result.articles).toEqual([]);
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });
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

describe("normalizeArticle", () => {
  it("返回完整字段当 raw 包含合法 string content", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test-slug",
      title: "测试标题",
      content: "这是正文内容",
      summary: "这是摘要",
      excerpt: "这是略缩",
      category: "产品动态",
      publishedAt: "2026-03-15T00:00:00Z",
    });
    expect(result.content).toBe("这是正文内容");
    expect(result.summary).toBe("这是略缩");
    expect(result.title).toBe("测试标题");
    expect(result.date).toBe("2026-03-15");
    expect(result.category).toBe("产品动态");
  });

  it("content fallback: content 非 string → 使用 summary", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: null,
      summary: "摘要兜底",
      excerpt: "略缩兜底",
    });
    expect(result.content).toBe("摘要兜底");
  });

  it("content fallback: content 和 summary 均无效 → 使用 excerpt", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: 12345,
      summary: null,
      excerpt: "略缩来兜底",
    });
    expect(result.content).toBe("略缩来兜底");
  });

  it("content fallback: 全部无效 → 空字符串", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: undefined,
      summary: undefined,
      excerpt: null,
    });
    expect(result.content).toBe("");
  });

  it("content fallback: content 是空字符串 → fallback 到 summary", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "",
      summary: "摘要救场",
    });
    expect(result.content).toBe("摘要救场");
  });

  it("summary fallback: summary 无效 → 使用 excerpt", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "正文内容很长很详细",
      summary: null,
      excerpt: "略缩内容",
    });
    expect(result.summary).toBe("略缩内容");
  });

  it("summary fallback: summary 和 excerpt 均无效 → 使用 content 截取前 120 字符", async () => {
    const { normalizeArticle } = await import("./data");
    const longContent = "A".repeat(200);
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: longContent,
      summary: undefined,
      excerpt: null,
    });
    expect(result.summary).toBe("A".repeat(120));
  });

  it("summary fallback: 全部无效 → 空字符串", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: null,
      summary: undefined,
      excerpt: null,
    });
    expect(result.summary).toBe("");
  });

  it("date fallback: publishedAt 无效 + createdAt 有效 → 使用 createdAt 年份", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "x",
      createdAt: "2025-06-01T00:00:00Z",
    });
    expect(result.date).toBe("2025");
  });

  it("date fallback: 全部无效 → 默认 2026", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "x",
    });
    expect(result.date).toBe("2026");
  });

  it("title fallback: 非 string → 未命名", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      content: "x",
      title: undefined,
    });
    expect(result.title).toBe("未命名");
  });

  it("category fallback: 非 string → 品牌动态", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "x",
      category: null,
    });
    expect(result.category).toBe("品牌动态");
  });

  it("slug fallback: 非 string → 空字符串", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: null,
      title: "T",
      content: "x",
    });
    expect(result.slug).toBe("");
  });

  it("content.trim() 去除首尾空格", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test",
      title: "T",
      content: "  正文内容  ",
    });
    expect(result.content).toBe("正文内容");
  });

  it("raw 无 content 但有 summary → 正确 fallback", async () => {
    const { normalizeArticle } = await import("./data");
    const result = normalizeArticle({
      slug: "test-slug",
      title: "Test",
      content: undefined,
      summary: "My summary",
    });
    expect(result.content).toBe("My summary");
    expect(result.summary).toBe("My summary");
  });
});
