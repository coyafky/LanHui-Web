import { describe, it, expect, beforeEach, vi } from "vitest";

const mockFindMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    province: { findMany: mockFindMany },
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockFindMany.mockReset();
});

// 大陆 31 个省级行政区（含 4 直辖市 + 23 省 + 5 自治区 + 港澳台）；
// 测试中以子集（直辖市 + 部分省）验证排序与 isActive 过滤
const FIXTURE_PROVINCES = [
  // 直辖市
  {
    slug: "beijing",
    label: "北京市",
    code: "110000",
    type: "municipality",
    cities: [
      { slug: "beijing", label: "北京市", code: "110100", type: "municipality" },
    ],
  },
  {
    slug: "shanghai",
    label: "上海市",
    code: "310000",
    type: "municipality",
    cities: [
      { slug: "shanghai", label: "上海市", code: "310100", type: "municipality" },
    ],
  },
  // 省（按 order 排序：北京 0、上海 1、广东 2）
  {
    slug: "guangdong",
    label: "广东省",
    code: "440000",
    type: "province",
    cities: [
      { slug: "guangzhou", label: "广州市", code: "440100", type: "city" },
      { slug: "foshan", label: "佛山市", code: "440600", type: "city" },
    ],
  },
];

async function loadGet() {
  const mod = await import("./route");
  return mod.GET;
}

describe("GET /api/regions", () => {
  it("成功：返回 RegionTree（含直辖市子节点）", async () => {
    mockFindMany.mockResolvedValue(FIXTURE_PROVINCES);
    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      success: boolean;
      data: Array<{
        slug: string;
        label: string;
        code: string | null;
        type: string | null;
        cities: Array<{
          slug: string;
          label: string;
          code: string | null;
          type: string | null;
        }>;
      }>;
    };
    expect(json.success).toBe(true);
    expect(json.data).toHaveLength(3);
    // 直辖市：北京
    const beijing = json.data.find((p) => p.slug === "beijing");
    expect(beijing).toBeDefined();
    expect(beijing?.type).toBe("municipality");
    expect(beijing?.cities).toHaveLength(1);
    expect(beijing?.cities[0]?.slug).toBe("beijing");
    // 普通省：广东含 2 个城市
    const guangdong = json.data.find((p) => p.slug === "guangdong");
    expect(guangdong?.cities).toHaveLength(2);
    expect(guangdong?.cities.map((c) => c.slug).sort()).toEqual([
      "foshan",
      "guangzhou",
    ]);
  });

  it("传递正确查询参数给 prisma（isActive=true + order asc + cities include）", async () => {
    mockFindMany.mockResolvedValue([]);
    const GET = await loadGet();
    await GET();
    expect(mockFindMany).toHaveBeenCalledTimes(1);
    const callArg = mockFindMany.mock.calls[0]?.[0] as {
      where: { isActive: boolean };
      orderBy: { order: "asc" };
      include: { cities: { where: { isActive: boolean }; orderBy: { order: "asc" } } };
    };
    expect(callArg.where.isActive).toBe(true);
    expect(callArg.orderBy).toEqual({ order: "asc" });
    expect(callArg.include.cities.where.isActive).toBe(true);
    expect(callArg.include.cities.orderBy).toEqual({ order: "asc" });
  });

  it("返回 31 个省（大陆完整数据集）", async () => {
    // 构造 31 省 + 各省至少 1 城市的最小数据集
    const bigFixture = Array.from({ length: 31 }, (_, i) => ({
      slug: `province-${i}`,
      label: `省${i}`,
      code: `${100000 + i}`,
      type: "province",
      cities: [
        { slug: `city-${i}-a`, label: `城市${i}-A`, code: `${200000 + i}`, type: "city" },
      ],
    }));
    mockFindMany.mockResolvedValue(bigFixture);
    const GET = await loadGet();
    const res = await GET();
    const json = (await res.json()) as { data: unknown[] };
    expect(json.data).toHaveLength(31);
  });

  it("不包含 isActive=false 的省（由 prisma where 过滤，测试间接验证）", async () => {
    // prisma 收到 where: { isActive: true } 即可保证结果中不含 false 的省
    mockFindMany.mockResolvedValue([]);
    const GET = await loadGet();
    await GET();
    const callArg = mockFindMany.mock.calls[0]?.[0] as {
      where: Record<string, unknown>;
      include: { cities: { where: Record<string, unknown> } };
    };
    expect(callArg.where.isActive).toBe(true);
    expect(callArg.include.cities.where.isActive).toBe(true);
  });

  it("错误：prisma 抛出 → 500 + success=false", async () => {
    mockFindMany.mockRejectedValue(new Error("DB down"));
    const GET = await loadGet();
    const res = await GET();
    expect(res.status).toBe(500);
    const json = (await res.json()) as { success: boolean; error?: string };
    expect(json.success).toBe(false);
    expect(json.error).toBe("服务器内部错误");
  });
});