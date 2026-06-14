import { describe, it, expect, beforeEach, vi } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreCreate = vi.hoisted(() => vi.fn());
const mockStoreFindMany = vi.hoisted(() => vi.fn());
const mockStoreCount = vi.hoisted(() => vi.fn());
const mockFindRegion = vi.hoisted(() => vi.fn());
const mockFindCity = vi.hoisted(() => vi.fn());
const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      create: mockStoreCreate,
      findMany: mockStoreFindMany,
      count: mockStoreCount,
    },
  },
}));
vi.mock("@/lib/store-regions", () => ({
  findRegion: mockFindRegion,
  findCity: mockFindCity,
}));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));

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

const GUANGDONG_REGION = {
  slug: "guangdong",
  label: "广东省",
  cities: [
    { slug: "guangzhou", label: "广州市", isCapital: true },
    { slug: "foshan", label: "佛山市" },
  ],
};

const FOSHAN_CITY = { slug: "foshan", label: "佛山市" };

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreCreate.mockReset();
  mockStoreFindMany.mockReset();
  mockStoreCount.mockReset();
  mockFindRegion.mockReset();
  mockFindCity.mockReset();
  mockLogActivity.mockReset();
  mockStoreFindMany.mockResolvedValue([]);
  mockStoreCount.mockResolvedValue(0);
  // 默认值：合法省/市 — 测试如需覆盖可单独 mock
  mockFindRegion.mockReturnValue(GUANGDONG_REGION);
  mockFindCity.mockReturnValue({ city: FOSHAN_CITY, region: GUANGDONG_REGION });
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

describe("POST /api/stores", () => {
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

  it("参数验证失败返回 400 + 中文 details", async () => {
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

  it("省份不在 store-regions 中 → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockFindRegion.mockReturnValue(undefined);
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

  it("城市不属于 store-regions 该省 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockFindCity.mockReturnValue(null);
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

  it("创建成功：label 同步自 store-regions 源（即便客户端传错 label）", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_1", ...VALID_BODY });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // 客户端故意传错的 label（"广东" vs store-regions "广东省"）
      body: JSON.stringify({ ...VALID_BODY, provinceLabel: "广东", cityLabel: "佛山" }),
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

  it("创建成功返回 201 + data", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_1", ...VALID_BODY });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const json = (await res.json()) as { success?: boolean; data?: { id: string } };
    expect(json.success).toBe(true);
    expect(json.data?.id).toBe("store_1");
  });

  it("创建门店 isActive=false → 201 且 prisma.store.create 收到 isActive=false", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_2", ...VALID_BODY, isActive: false });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...VALID_BODY, isActive: false }),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    expect(mockStoreCreate).toHaveBeenCalledTimes(1);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as { data: { isActive: boolean } };
    expect(callArg.data.isActive).toBe(false);
  });

  it("创建门店不传 isActive → 缺省值 true 透传给 prisma.store.create", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreCreate.mockResolvedValue({ id: "store_3", ...VALID_BODY });
    const POST = await loadPost();
    const req = new Request("http://localhost/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(VALID_BODY),
    });
    const res = await POST(req as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockStoreCreate.mock.calls[0]?.[0] as { data: { isActive: boolean } };
    expect(callArg.data.isActive).toBe(true);
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