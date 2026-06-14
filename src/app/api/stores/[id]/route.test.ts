import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreFindFirst = vi.hoisted(() => vi.fn());
const mockStoreUpdate = vi.hoisted(() => vi.fn());
const mockProvinceFindUnique = vi.hoisted(() => vi.fn());
const mockCityFindUnique = vi.hoisted(() => vi.fn());
const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findFirst: mockStoreFindFirst,
      update: mockStoreUpdate,
    },
    province: { findUnique: mockProvinceFindUnique },
    city: { findUnique: mockCityFindUnique },
  },
}));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));

const EXISTING_STORE = {
  id: "store_1",
  slug: "shunde-daliang",
  name: "原门店名",
  provinceSlug: "guangdong",
  provinceLabel: "广东省",
  citySlug: "foshan",
  cityLabel: "佛山市",
  address: "原地址",
  phone: "0757-10000001",
  isActive: true,
};

const GUANGDONG_DB = {
  slug: "guangdong",
  label: "广东省",
  isActive: true,
};
const FOSHAN_DB = {
  slug: "foshan",
  label: "佛山市",
  provinceSlug: "guangdong",
  isActive: true,
};
const BEIJING_DB = {
  slug: "beijing",
  label: "北京市",
  isActive: true,
};
const BEIJING_CITY_DB = {
  slug: "beijing",
  label: "北京市",
  provinceSlug: "beijing",
  isActive: true,
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreFindFirst.mockReset();
  mockStoreUpdate.mockReset();
  mockProvinceFindUnique.mockReset();
  mockCityFindUnique.mockReset();
  mockLogActivity.mockReset();
  mockStoreFindFirst.mockResolvedValue(EXISTING_STORE);
  mockProvinceFindUnique.mockResolvedValue(GUANGDONG_DB);
  mockCityFindUnique.mockResolvedValue(FOSHAN_DB);
  mockStoreUpdate.mockImplementation(async ({ data }) => ({
    ...EXISTING_STORE,
    ...data,
  }));
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPut() {
  const mod = await import("./route");
  return mod.PUT;
}

function buildPutReq(id: string, body: Record<string, unknown>): NextRequest {
  return new NextRequest(`http://localhost/api/stores/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/stores/[id] — 鉴权", () => {
  it("未认证返回 401", async () => {
    mockAuth.mockResolvedValue(null);
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { name: "新名" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(401);
  });

  it("非 admin 返回 403", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { name: "新名" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(403);
  });

  it("门店不存在 → 404", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(null);
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("nonexistent", { name: "新名" }),
      { params: Promise.resolve({ id: "nonexistent" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/stores/[id] — 不动省/市的纯字段更新", () => {
  it("只更新电话 → 跳过省/市 DB 校验", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { phone: "0757-9999 8888" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(200);
    // 关键断言：未传 provinceSlug/citySlug 时，不查 prisma.province/city
    expect(mockProvinceFindUnique).not.toHaveBeenCalled();
    expect(mockCityFindUnique).not.toHaveBeenCalled();
    expect(mockStoreUpdate).toHaveBeenCalledTimes(1);
    const callArg = mockStoreUpdate.mock.calls[0]?.[0] as {
      data: { phone: string; provinceLabel?: string };
    };
    expect(callArg.data.phone).toBe("0757-9999 8888");
    // 没有 provinceSlug → 不重写 provinceLabel
    expect(callArg.data.provinceLabel).toBeUndefined();
  });

  it("只更新门店名 → 跳过省/市 DB 校验 + 保留原 label", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { name: "新门店名" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(200);
    expect(mockProvinceFindUnique).not.toHaveBeenCalled();
    expect(mockCityFindUnique).not.toHaveBeenCalled();
  });
});

describe("PUT /api/stores/[id] — 更新到 active 省份/城市", () => {
  it("更新省份到北京 + 城市到北京 → 200 + DB label 写入", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue(BEIJING_DB);
    mockCityFindUnique.mockResolvedValue(BEIJING_CITY_DB);
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", {
        provinceSlug: "beijing",
        provinceLabel: "旧label客户端",
        citySlug: "beijing",
        cityLabel: "旧label客户端",
      }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(200);
    expect(mockProvinceFindUnique).toHaveBeenCalledWith({
      where: { slug: "beijing" },
    });
    expect(mockCityFindUnique).toHaveBeenCalledWith({
      where: { slug: "beijing" },
    });
    const callArg = mockStoreUpdate.mock.calls[0]?.[0] as {
      data: { provinceLabel: string; cityLabel: string };
    };
    expect(callArg.data.provinceLabel).toBe("北京市");
    expect(callArg.data.cityLabel).toBe("北京市");
  });

  it("只更新城市（省份不变）→ 省份 fallback 到 existing", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { citySlug: "guangzhou" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(200);
    // 城市没传 → 仍然校验（因为声明了 citySlug）
    // 但省份没传 → 用 existing.provinceSlug 校验（"guangdong"）
    expect(mockProvinceFindUnique).toHaveBeenCalledWith({
      where: { slug: "guangdong" },
    });
  });
});

describe("PUT /api/stores/[id] — 省/市校验失败", () => {
  it("更新到不存在的省份 → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue(null);
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { provinceSlug: "nowhere" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.provinceSlug).toContain("请选择已开通的省份");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("更新到 inactive 省份 → 400 + details.provinceSlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue({ ...BEIJING_DB, isActive: false });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { provinceSlug: "beijing" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.provinceSlug).toContain("请选择已开通的省份");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("更新到 inactive 城市 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockCityFindUnique.mockResolvedValue({ ...FOSHAN_DB, isActive: false });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { citySlug: "foshan" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.citySlug).toContain("所选城市暂未开通或不属于所选省份");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("更新到不属于所选省份的城市 → 400 + details.citySlug", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockProvinceFindUnique.mockResolvedValue(BEIJING_DB);
    // 城市属于广东省，provinceSlug 不匹配 beijing
    mockCityFindUnique.mockResolvedValue({
      ...FOSHAN_DB,
      provinceSlug: "guangdong",
    });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", {
        provinceSlug: "beijing",
        citySlug: "foshan",
      }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.citySlug).toContain("所选城市暂未开通或不属于所选省份");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });
});

describe("PUT /api/stores/[id] — Prisma 兜底", () => {
  it("P2003 (foreign key) 兜底 → 400 + _form details", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreUpdate.mockRejectedValue({
      code: "P2003",
      meta: { field_name: "provinceSlug" },
    });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { phone: "0757-0000 0000" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?._form).toBeDefined();
  });

  it("P2002 (slug 重复) → 409", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreUpdate.mockRejectedValue({
      code: "P2002",
      meta: { target: ["slug"] },
    });
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { phone: "0757-0000 0000" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(409);
  });

  it("其他错误 → 500", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreUpdate.mockRejectedValue(new Error("DB down"));
    const PUT = await loadPut();
    const res = await PUT(
      buildPutReq("store_1", { phone: "0757-0000 0000" }),
      { params: Promise.resolve({ id: "store_1" }) } as unknown as Parameters<typeof PUT>[1],
    );
    expect(res.status).toBe(500);
  });
});