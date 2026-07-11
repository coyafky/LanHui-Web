import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreFindFirst = vi.hoisted(() => vi.fn());
const mockStoreUpdate = vi.hoisted(() => vi.fn());
const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findFirst: mockStoreFindFirst,
      update: mockStoreUpdate,
    },
  },
}));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));
vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }));
vi.mock("@/lib/security/rate-limit", () => ({ rateLimiter: { check: () => ({ ok: true, remaining: 59, limit: 60, resetAt: Date.now() + 60_000 }) } }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const PENDING_STORE = {
  id: "store_pending",
  slug: "shunde-daliang",
  name: "顺德大良店",
  status: "pending",
  isActive: false,
  level: "premium",
  provinceSlug: "guangdong",
  citySlug: "foshan",
  phone: "13800138000",
  address: "顺德大良街道xxx",
  businessHours: "09:00-18:00",
};

const ACTIVE_STORE = {
  id: "store_active",
  slug: "guangzhou-tianhe",
  name: "广州天河店",
  status: "active",
  isActive: true,
  level: "flagship",
  provinceSlug: "guangdong",
  citySlug: "guangzhou",
  phone: "13800138001",
  address: "广州天河xxx",
  businessHours: "10:00-20:00",
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreFindFirst.mockReset();
  mockStoreUpdate.mockReset();
  mockLogActivity.mockReset();
  mockLogActivity.mockResolvedValue(undefined);
  mockStoreUpdate.mockImplementation(async ({ data }) => ({
    ...PENDING_STORE,
    ...data,
  }));
});

async function loadPOST() {
  const mod = await import("./route");
  return mod.POST;
}

function buildReq(id: string, body: Record<string, unknown> | null): NextRequest {
  if (body === null) {
    return new NextRequest(`http://localhost/api/stores/${id}/publish`, {
      method: "POST",
    });
  }
  return new NextRequest(`http://localhost/api/stores/${id}/publish`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildReqWithAction(
  id: string,
  action: string,
  body: Record<string, unknown> | null
): NextRequest {
  if (body === null) {
    return new NextRequest(`http://localhost/api/stores/${id}/${action}`, {
      method: "POST",
    });
  }
  return new NextRequest(`http://localhost/api/stores/${id}/${action}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeCtx(id: string, action: string) {
  return {
    params: Promise.resolve({ id, action }),
  } as unknown as Parameters<Awaited<ReturnType<typeof loadPOST>>>[1];
}

describe("POST /api/stores/[id]/[action] — 鉴权", () => {
  it("未认证返回 401", async () => {
    mockAuth.mockResolvedValue(null);
    const POST = await loadPOST();
    const res = await POST(buildReq("store_pending", null), makeCtx("store_pending", "publish"));
    expect(res.status).toBe(401);
  });

  it("非 admin 返回 403", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "editor" } });
    const POST = await loadPOST();
    const res = await POST(buildReq("store_pending", null), makeCtx("store_pending", "publish"));
    expect(res.status).toBe(403);
  });
});

describe("POST /api/stores/[id]/[action] — 路由解析", () => {
  it("未知 action → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "bogus")
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toMatch(/未知/);
  });

  it("门店不存在 → 404", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(null);
    const POST = await loadPOST();
    const res = await POST(
      buildReq("missing", null),
      makeCtx("missing", "publish")
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /api/stores/[id]/publish — pending→active", () => {
  it("成功：写入 status=active + isActive=true + log store.publish", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(PENDING_STORE);
    mockStoreUpdate.mockResolvedValue({
      ...PENDING_STORE,
      status: "active",
      isActive: true,
    });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(200);
    const callArg = mockStoreUpdate.mock.calls[0]?.[0] as {
      data: { status: string; isActive: boolean; statusChangedBy: string };
    };
    expect(callArg.data.status).toBe("active");
    expect(callArg.data.isActive).toBe(true);
    expect(callArg.data.statusChangedBy).toBe("u1");
    expect(mockLogActivity).toHaveBeenCalledTimes(1);
    const logArg = mockLogActivity.mock.calls[0]?.[0] as {
      action: string;
      metadata: { from: string; to: string };
    };
    expect(logArg.action).toBe("store.publish");
    expect(logArg.metadata.from).toBe("pending");
    expect(logArg.metadata.to).toBe("active");
  });

  it("失败：active 状态下 publish → 409", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(ACTIVE_STORE);
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_active", null),
      makeCtx("store_active", "publish")
    );
    expect(res.status).toBe(409);
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("失败：pending 但缺 level → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue({ ...PENDING_STORE, level: null });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(400);
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });
});

describe("POST /api/stores/[id]/suspend — active→suspended", () => {
  it("成功：传 statusReason → 写入 suspended + log", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(ACTIVE_STORE);
    mockStoreUpdate.mockResolvedValue({
      ...ACTIVE_STORE,
      status: "suspended",
      isActive: false,
    });
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "suspend", {
        statusReason: "门店装修暂停",
      }),
      makeCtx("store_active", "suspend")
    );
    expect(res.status).toBe(200);
    const callArg = mockStoreUpdate.mock.calls[0]?.[0] as {
      data: { status: string; isActive: boolean; statusReason: string };
    };
    expect(callArg.data.status).toBe("suspended");
    expect(callArg.data.isActive).toBe(false);
    expect(callArg.data.statusReason).toBe("门店装修暂停");
  });

  it("失败：缺 statusReason → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(ACTIVE_STORE);
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "suspend", { statusReason: "  " }),
      makeCtx("store_active", "suspend")
    );
    expect(res.status).toBe(400);
    const json = (await res.json()) as { details?: Record<string, string[]> };
    expect(json.details?.statusReason).toBeDefined();
  });
});

describe("POST /api/stores/[id]/resume — suspended→active", () => {
  it("成功：phone/address/businessHours 都齐全 → 200", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const suspendedStore = { ...ACTIVE_STORE, status: "suspended", isActive: false };
    mockStoreFindFirst.mockResolvedValue(suspendedStore);
    mockStoreUpdate.mockResolvedValue({ ...suspendedStore, status: "active", isActive: true });
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "resume", null),
      makeCtx("store_active", "resume")
    );
    expect(res.status).toBe(200);
  });

  it("失败：缺 businessHours → 400", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const suspendedStore = {
      ...ACTIVE_STORE,
      status: "suspended",
      isActive: false,
      businessHours: null,
    };
    mockStoreFindFirst.mockResolvedValue(suspendedStore);
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "resume", null),
      makeCtx("store_active", "resume")
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/stores/[id]/terminate — pending/suspended→terminated", () => {
  it("成功：suspended + statusReason → 200 + log store.terminate", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const suspendedStore = { ...ACTIVE_STORE, status: "suspended", isActive: false };
    mockStoreFindFirst.mockResolvedValue(suspendedStore);
    mockStoreUpdate.mockResolvedValue({
      ...suspendedStore,
      status: "terminated",
      isActive: false,
    });
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "terminate", {
        statusReason: "门店关闭",
      }),
      makeCtx("store_active", "terminate")
    );
    expect(res.status).toBe(200);
    const logArg = mockLogActivity.mock.calls[0]?.[0] as { action: string };
    expect(logArg.action).toBe("store.terminate");
  });

  it("失败：active 不能直接 terminate → 409", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(ACTIVE_STORE);
    const POST = await loadPOST();
    const res = await POST(
      buildReqWithAction("store_active", "terminate", { statusReason: "x" }),
      makeCtx("store_active", "terminate")
    );
    expect(res.status).toBe(409);
  });
});

describe("POST /api/stores/[id]/[action] — Prisma 兜底", () => {
  it("P2022 (ColumnNotFound) → 500", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(PENDING_STORE);
    mockStoreUpdate.mockRejectedValue({
      code: "P2022",
      meta: { modelName: "Store" },
    });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(500);
  });

  it("其他错误 → 500", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(PENDING_STORE);
    mockStoreUpdate.mockRejectedValue(new Error("DB down"));
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(500);
  });
});

describe("POST /api/stores/[id]/publish — 旗舰店唯一性约束", () => {
  const PENDING_FLAGSHIP = {
    ...PENDING_STORE,
    level: "flagship" as const,
    provinceSlug: "guangdong",
    citySlug: "foshan",
  };

  it("发布 flagship 门店,同城已有其他旗舰店 → 409", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    // 1st findFirst: 获取当前门店 (flagship, pending)
    // 2nd findFirst: checkFlagshipPerCity 找到同城已有其他旗舰店
    mockStoreFindFirst
      .mockResolvedValueOnce(PENDING_FLAGSHIP)
      .mockResolvedValueOnce({ id: "store_other_f", name: "同城另一旗舰店" });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string; details?: Record<string, string[]> };
    expect(json.error).toBe("该城市已存在星辉旗舰店");
    expect(json.details?.level).toContain("每个城市最多只能设置一个星辉旗舰店");
    expect(mockStoreUpdate).not.toHaveBeenCalled();
  });

  it("发布唯一旗舰店成功 (当前城市无其他旗舰店)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    // 1st findFirst: 获取当前门店 (flagship)
    // 2nd findFirst: checkFlagshipPerCity 无冲突
    mockStoreFindFirst
      .mockResolvedValueOnce(PENDING_FLAGSHIP)
      .mockResolvedValueOnce(null);
    mockStoreUpdate.mockResolvedValue({
      ...PENDING_FLAGSHIP,
      status: "active",
      isActive: true,
    });
    const POST = await loadPOST();
    const res = await POST(
      buildReq("store_pending", null),
      makeCtx("store_pending", "publish")
    );
    expect(res.status).toBe(200);
    expect(mockStoreUpdate).toHaveBeenCalledTimes(1);
  });
});
