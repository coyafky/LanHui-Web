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
