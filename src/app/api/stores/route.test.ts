import { describe, it, expect, beforeEach, vi } from "vitest";

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