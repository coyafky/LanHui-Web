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
    province: {
      findUnique: mockProvinceFindUnique,
    },
    city: {
      findUnique: mockCityFindUnique,
    },
  },
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

const ACTIVE_PROVINCE = { slug: "guangdong", label: "广东", isActive: true };
const ACTIVE_CITY = {
  slug: "foshan",
  provinceSlug: "guangdong",
  label: "佛山",
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
  // 默认值：合法省市 — 测试如需覆盖可单独 mock
  mockProvinceFindUnique.mockResolvedValue(ACTIVE_PROVINCE);
  mockCityFindUnique.mockResolvedValue(ACTIVE_CITY);
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

  it("省份不存在 → 400 + details.provinceSlug", async () => {
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

  it("省份已禁用 → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue({ ...ACTIVE_PROVINCE, isActive: false });
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
  });

  it("城市不存在 → 400 + details.citySlug", async () => {
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
    expect(json.details?.citySlug).toContain("请选择已开通的城市");
    expect(mockStoreCreate).not.toHaveBeenCalled();
  });

  it("城市不属于省份 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    // nanjing 属于 jiangsu，不是 guangdong
    mockCityFindUnique.mockResolvedValue({
      slug: "nanjing",
      provinceSlug: "jiangsu",
      label: "南京",
      isActive: true,
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
    expect(json.details?.citySlug).toContain("所选城市不属于所选省份");
    expect(mockStoreCreate).not.toHaveBeenCalled();
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
    // 预校验通过但 prisma.store.create 仍抛 P2003（极端并发场景：预校验后省市被禁用）
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
});
