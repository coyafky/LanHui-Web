import { describe, it, expect, beforeEach, vi } from "vitest";

const mockGroupBy = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      groupBy: mockGroupBy,
    },
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockGroupBy.mockReset();
});

async function loadGet() {
  const mod = await import("./route");
  return mod.GET;
}

describe("GET /api/articles/categories — 分类字典", () => {
  it("过滤掉 null + 按 value 升序 + 透出 count", async () => {
    // Prisma groupBy 在应用层 where 已过滤 null，这里模拟「数据库没有 null」的真实场景
    mockGroupBy.mockResolvedValue([
      { category: "门店动态", _count: { _all: 1 } },
      { category: "产品动态", _count: { _all: 3 } },
      { category: "品牌动态", _count: { _all: 4 } },
      { category: "产品知识", _count: { _all: 1 } },
    ]);

    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      success: boolean;
      data: { categories: { value: string; label: string; count: number }[] };
    };
    expect(json.success).toBe(true);
    expect(json.data.categories).toEqual([
      { value: "产品动态", label: "产品动态", count: 3 },
      { value: "产品知识", label: "产品知识", count: 1 },
      { value: "门店动态", label: "门店动态", count: 1 },
      { value: "品牌动态", label: "品牌动态", count: 4 },
    ]);
  });

  it("数据库没有文章时 → 返回空数组 (不报错)", async () => {
    mockGroupBy.mockResolvedValue([]);

    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(200);

    const json = (await res.json()) as {
      data: { categories: unknown[] };
    };
    expect(json.data.categories).toEqual([]);
  });

  it("Prisma 抛错 → 返回 500 + 标准错误结构", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGroupBy.mockRejectedValue(new Error("DB down"));

    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(500);

    const json = (await res.json()) as { success: boolean; error: string };
    expect(json.success).toBe(false);
    expect(json.error).toBe("服务器内部错误");
    expect(consoleSpy).toHaveBeenCalledOnce();
    consoleSpy.mockRestore();
  });
});
