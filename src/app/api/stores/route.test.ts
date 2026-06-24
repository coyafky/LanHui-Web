import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreCreate = vi.hoisted(() => vi.fn());
const mockStoreFindMany = vi.hoisted(() => vi.fn());
const mockStoreCount = vi.hoisted(() => vi.fn());
const mockProvinceFindUnique = vi.hoisted(() => vi.fn());
const mockCityFindUnique = vi.hoisted(() => vi.fn());
const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      create: mockStoreCreate,
      findMany: mockStoreFindMany,
      count: mockStoreCount,
    },
    province: { findUnique: mockProvinceFindUnique },
    city: { findUnique: mockCityFindUnique },
  },
}));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));

// Note: P2 阶段 store-regions 已不再被 POST 引用，移除其 mock
// vi.mock("@/lib/store-regions", ...) 已删除

const VALID_BODY = {
  slug: "shunde-daliang",
  name: "蓝辉轻改顺德大良店",
  provinceSlug: "guangdong",
  provinceLabel: "广东",
  citySlug: "foshan",
  cityLabel: "佛山",
  address: "广东省佛山市顺德区大良街道xxx",
  phone: "0757-2288 1001",
};

const GUANGDONG_DB = {
  slug: "guangdong",
  label: "广东省",
  code: "440000",
  type: "province",
  isActive: true,
};
const FOSHAN_DB = {
  slug: "foshan",
  label: "佛山市",
  code: "440600",
  type: "city",
  provinceSlug: "guangdong",
  isActive: true,
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreCreate.mockReset();
  mockStoreFindMany.mockReset();
  mockStoreCount.mockReset();
  mockProvinceFindUnique.mockReset();
  mockCityFindUnique.mockReset();
  mockLogActivity.mockReset();
  mockStoreFindMany.mockResolvedValue([]);
  mockStoreCount.mockResolvedValue(0);
  // 默认值：合法活跃省/市 — 测试可单独覆盖
  mockProvinceFindUnique.mockResolvedValue(GUANGDONG_DB);
  mockCityFindUnique.mockResolvedValue(FOSHAN_DB);
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

describe("POST /api/stores — 鉴权", () => {
  it("未认证返回 401", async () => {
    mockAuth.mockResolvedValue(null);
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
  });

  it("非 admin 返回 403", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(403);
  });
});

describe("POST /api/stores — DB 校验（AC-5）", () => {
  it("省份在 DB 不存在 → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue(null);
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.provinceSlug).toContain("请选择已开通的省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("省份 inactive → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue({ ...GUANGDONG_DB, isActive: false });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.provinceSlug).toContain("请选择已开通的省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("城市在 DB 不存在 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockCityFindUnique.mockResolvedValue(null);
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.citySlug).toContain("所选城市暂未开通或不属于所选省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("城市 inactive → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockCityFindUnique.mockResolvedValue({ ...FOSHAN_DB, isActive: false });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.citySlug).toContain("所选城市暂未开通或不属于所选省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("城市不属于该省份 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockCityFindUnique.mockResolvedValue({
      ...FOSHAN_DB,
      provinceSlug: "guangxi", // 故意错配
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.citySlug).toContain("所选城市暂未开通或不属于所选省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });
});

describe("POST /api/stores — 创建成功路径", () => {
  it("创建成功 → 201 + data + store.create 收到 DB 权威 label（AC-5）", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_1", ...VALID_BODY });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // 客户端故意传错 label（"广东" vs DB "广东省"）
      body: JSON.stringify({
        ...VALID_BODY,
        provinceLabel: "广东",
        cityLabel: "佛山",
      }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    expect(mockStoreCreate).toHaveBeenCalledTimes(1);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as {
      data: { provinceLabel: string; cityLabel: string };
    };
    expect(callArg.data.provinceLabel).toBe("广东省");
    expect(callArg.data.cityLabel).toBe("佛山市");
  });

  it("创建成功：客户端不传 label → DB label 仍写入", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_2", ...VALID_BODY });
    const POST = await loadPost();
    const { provinceLabel: _p, cityLabel: _c, ...bodyWithoutLabels } = VALID_BODY;
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(bodyWithoutLabels),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as {
      data: { provinceLabel: string; cityLabel: string };
    };
    expect(callArg.data.provinceLabel).toBe("广东省");
    expect(callArg.data.cityLabel).toBe("佛山市");
  });

  it("重复 slug (P2002) 返回 409 + 中文 details", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue({
      code: "P2002",
      meta: { target: ["slug"] },
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(409);
    const json = (await res.json()) as {
      error?: string;
      details?: Record<string, string[]>;
    };
    expect(json.error).toBe("URL标识已存在");
    expect(json.details?.slug).toContain("该 URL 标识已被其他门店使用");
  });

  it("P2002 on 其他字段返回 409 + 通用 details", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue({
      code: "P2002",
      meta: { target: ["phone"] },
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(409);
  });

  it("P2003 (foreign key) 兜底 → 400 + _form details", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue({
      code: "P2003",
      meta: { field_name: "provinceSlug" },
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?._form).toBeDefined();
  });

  it("其他 Prisma 错误返回 500", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue(new Error("DB down"));
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(500);
  });

  it("参数验证失败（schema）返回 400 + 中文 details", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...VALID_BODY, provinceSlug: "" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.provinceSlug).toContain("请选择省份");
  });
});

describe("POST /api/stores — Prisma 7 driverAdapterError P2002 structure", () => {
  it("Prisma 7 新结构 slug 冲突 → 409 + slug-specific 响应", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue({
      code: "P2002",
      meta: {
        modelName: "Store",
        driverAdapterError: {
          cause: {
            originalCode: "23505",
            kind: "UniqueConstraintViolation",
            constraint: { fields: ["slug"] },
          },
        },
      },
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(409);
    const json = (await res.json()) as {
      error?: string;
      details?: Record<string, string[]>;
    };
    expect(json.error).toBe("URL标识已存在");
    expect(json.details?.slug).toContain("该 URL 标识已被其他门店使用");
  });

  it("Prisma 7 新结构 其它字段冲突 → 409 + 通用响应", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockRejectedValue({
      code: "P2002",
      meta: {
        modelName: "Store",
        driverAdapterError: {
          cause: {
            originalCode: "23505",
            kind: "UniqueConstraintViolation",
            constraint: { fields: ["phone"] },
          },
        },
      },
    });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(409);
    const json = (await res.json()) as {
      error?: string;
      details?: Record<string, string[]>;
    };
    expect(json.error).toBe("数据已存在");
    expect(json.details?._form).toBeDefined();
  });
});

// ────────────────────────────────────────────────────────────────────
// 子任务 3 增量:GET level 筛选 + POST slug 自动生成
// ────────────────────────────────────────────────────────────────────

describe("GET /api/stores — level 筛选（子任务 3）", () => {
  async function loadGet() {
    const mod = await import("./route");
    return mod.GET;
  }

  function buildGetReq(query: string): NextRequest {
    return new NextRequest(`http://localhost/api/stores?${query}`);
  }

  it("单个 ?level=flagship → Prisma where.level = { in: [flagship] }", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1", level: "flagship" }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    const res = await GET(buildGetReq("level=flagship") as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    expect(mockStoreFindMany).toHaveBeenCalledTimes(1);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      level?: { in?: string[] };
    };
    expect(whereArg.level).toEqual({ in: ["flagship"] });
  });

  it("多值 ?level=flagship&level=premium → { in: [flagship, premium] }", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    const res = await GET(buildGetReq("level=flagship&level=premium") as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      level?: { in?: string[] };
    };
    expect(whereArg.level).toEqual({ in: ["flagship", "premium"] });
  });

  it("无 level 参数 → where 不含 level 字段", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    const res = await GET(buildGetReq("") as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      level?: unknown;
    };
    expect(whereArg.level).toBeUndefined();
  });

  it("兼容 ?isActive=true → 显式 isActive=true（覆盖默认）", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    const res = await GET(buildGetReq("isActive=true") as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      isActive?: boolean;
    };
    expect(whereArg.isActive).toBe(true);
  });

  it("兼容 ?isActive=false → 显式 isActive=false", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    const res = await GET(buildGetReq("isActive=false") as unknown as Parameters<typeof GET>[0]);
    expect(res.status).toBe(200);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      isActive?: boolean;
    };
    expect(whereArg.isActive).toBe(false);
  });
});

describe("POST /api/stores — slug 自动生成（子任务 3）", () => {
  it("body 提供 slug → 尊重传入（不调 findMany 查现有 slug）", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_x", slug: "my-custom-slug" });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // 11 位合法 phone(VALID_BODY phone 不通过 Zod PHONE_REGEX)
      body: JSON.stringify({ ...VALID_BODY, slug: "my-custom-slug", phone: "13800138000" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as { data: { slug: string } };
    expect(callArg.data.slug).toBe("my-custom-slug");
  });

  it("body.slug 为空字符串 → 自动基于 name 生成", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreFindMany.mockResolvedValue([]); // 没有任何已有 slug
    mockStoreCreate.mockResolvedValue({ id: "store_y", slug: "shunde-daliang" });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // phone 必须是 11 位数字(VALID_BODY 的 "0757-2288 1001" 不通过 Zod)
      body: JSON.stringify({ ...VALID_BODY, slug: "", phone: "13800138000" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as { data: { slug: string } };
    // VALID_BODY.name = "蓝辉轻改顺德大良店" → pinyin 转换后含 'shunde-daliang' 之类的
    expect(callArg.data.slug).toBeTruthy();
    expect(callArg.data.slug.length).toBeGreaterThan(0);
  });

// ────────────────────────────────────────────────────────────────────
// 子任务 T3:搜索范围扩展 — phone + slug 模糊搜索
// ────────────────────────────────────────────────────────────────────

describe("GET /api/stores — 搜索范围扩展（T3）", () => {
  async function loadGet() {
    const mod = await import("./route");
    return mod.GET;
  }

  function buildGetReq(query: string): NextRequest {
    return new NextRequest(`http://localhost/api/stores?${query}`);
  }

  it("?search=0757 → OR 包含 phone 模糊匹配", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1", phone: "0757-2288 1001" }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    await GET(buildGetReq("search=0757") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      OR?: Array<Record<string, unknown>>;
    };
    expect(whereArg.OR).toBeDefined();
    const phoneClause = whereArg.OR?.find(
      (c) => typeof c === "object" && c !== null && "phone" in c
    );
    expect(phoneClause).toEqual({
      phone: { contains: "0757", mode: "insensitive" },
    });
  });

  it("?search=daliang → OR 包含 slug 模糊匹配", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1", slug: "shunde-daliang" }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    await GET(buildGetReq("search=daliang") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      OR?: Array<Record<string, unknown>>;
    };
    expect(whereArg.OR).toBeDefined();
    const slugClause = whereArg.OR?.find(
      (c) => typeof c === "object" && c !== null && "slug" in c
    );
    expect(slugClause).toEqual({
      slug: { contains: "daliang", mode: "insensitive" },
    });
  });

  it("?search=大良 → OR 同时包含 name/address/phone/slug 四个字段", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1" }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    await GET(buildGetReq("search=%E5%A4%A7%E8%89%AF") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as {
      OR?: Array<Record<string, unknown>>;
    };
    expect(whereArg.OR).toHaveLength(4);
    const fields = whereArg.OR?.map((c) => Object.keys(c)[0]);
    expect(fields).toContain("name");
    expect(fields).toContain("address");
    expect(fields).toContain("phone");
    expect(fields).toContain("slug");
  });
});

// ────────────────────────────────────────────────────────────────────
// 子任务 T2:排序服务端落地 — sort 参数映射
// ────────────────────────────────────────────────────────────────────

describe("GET /api/stores — 排序服务端落地（T2）", () => {
  async function loadGet() {
    vi.resetModules();
    const mod = await import("./route");
    return mod.GET;
  }

  function buildGetReq(query: string): NextRequest {
    return new NextRequest(`http://localhost/api/stores?${query}`);
  }

  const sortCases: Array<[string, Record<string, string> | Array<Record<string, string>>]> = [
    ["sort=updated_desc", { updatedAt: "desc" }],
    ["sort=updated_asc", { updatedAt: "asc" }],
    ["sort=created_desc", { createdAt: "desc" }],
    ["sort=created_asc", { createdAt: "asc" }],
    ["sort=name_asc", { name: "asc" }],
    ["sort=name_desc", { name: "desc" }],
  ];

  it.each(sortCases)("%s → Prisma orderBy: %j", async (query, expected) => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    await GET(buildGetReq(query) as unknown as Parameters<typeof GET>[0]);
    const orderBy = mockStoreFindMany.mock.calls[0]?.[0]?.orderBy;
    expect(orderBy).toEqual(expected);
  });

  it("?sort=level_desc → orderBy: [{ level: desc }, { createdAt: desc }]", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    await GET(buildGetReq("sort=level_desc") as unknown as Parameters<typeof GET>[0]);
    const orderBy = mockStoreFindMany.mock.calls[0]?.[0]?.orderBy;
    expect(orderBy).toEqual([{ level: "desc" }, { createdAt: "desc" }]);
  });

  it("无 sort 参数 → 默认 createdAt desc（向后兼容）", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    await GET(buildGetReq("") as unknown as Parameters<typeof GET>[0]);
    const orderBy = mockStoreFindMany.mock.calls[0]?.[0]?.orderBy;
    expect(orderBy).toEqual({ createdAt: "desc" });
  });
});

// ────────────────────────────────────────────────────────────────────
// 子任务 T6:图片完整度筛选 — image=has / image=missing
// ────────────────────────────────────────────────────────────────────

describe("GET /api/stores — 图片完整度筛选（T6）", () => {
  async function loadGet() {
    vi.resetModules();
    const mod = await import("./route");
    return mod.GET;
  }

  function buildGetReq(query: string): NextRequest {
    return new NextRequest(`http://localhost/api/stores?${query}`);
  }

  it("?image=has → where.imagePath = { not: null }", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1", imagePath: "/stores/1.webp" }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    await GET(buildGetReq("image=has") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as Record<string, unknown>;
    expect(whereArg.imagePath).toEqual({ not: null });
  });

  it("?image=missing → where.imagePath = null", async () => {
    mockStoreFindMany.mockResolvedValue([{ id: "1", imagePath: null }]);
    mockStoreCount.mockResolvedValue(1);
    const GET = await loadGet();
    await GET(buildGetReq("image=missing") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as Record<string, unknown>;
    expect(whereArg.imagePath).toBeNull();
  });

  it("无 image 参数 → where 不含 imagePath 字段", async () => {
    mockStoreFindMany.mockResolvedValue([]);
    mockStoreCount.mockResolvedValue(0);
    const GET = await loadGet();
    await GET(buildGetReq("") as unknown as Parameters<typeof GET>[0]);
    const whereArg = mockStoreFindMany.mock.calls[0]?.[0]?.where as Record<string, unknown>;
    expect(whereArg.imagePath).toBeUndefined();
  });
});

  it("重名时自动追加 -2 后缀（toBaseSlug 冲突）", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    // 实际 pinyin 转换 base 是 "lan-hui-qing-gai-shun-de-da-liang-dian"
    // mock 已有同名 slug 触发 generateStoreSlug 走追加后缀逻辑
    mockStoreFindMany.mockResolvedValue([
      { slug: "lan-hui-qing-gai-shun-de-da-liang-dian" },
    ]);
    mockStoreCreate.mockResolvedValue({ id: "store_z" });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // 故意不传 slug,且用合法 11 位 phone
      body: JSON.stringify({ ...VALID_BODY, slug: undefined, phone: "13800138000" }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as { data: { slug: string } };
    // 不管 base 是什么,只要生成的 slug 包含 -2 后缀就算通过
    expect(callArg.data.slug).toMatch(/-2$/);
  });
});