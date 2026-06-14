import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findFirst: mockStoreFindFirst,
    },
  },
}));

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreFindFirst.mockReset();
});

async function loadGet() {
  const mod = await import("./route");
  return mod.GET;
}

const ACTIVE_STORE = { id: "100001", slug: "shunde-daliang", isActive: true };
const INACTIVE_STORE = { id: "100099", slug: "old-store", isActive: false };

function buildReq(url: string): NextRequest {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/stores/[id]", () => {
  it("默认行为：仅返回 isActive=true 门店", async () => {
    mockStoreFindFirst.mockResolvedValue(ACTIVE_STORE);
    const GET = await loadGet();
    const res = await GET(
      buildReq("http://localhost/api/stores/100001"),
      { params: Promise.resolve({ id: "100001" }) } as unknown as Parameters<typeof GET>[1],
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { id: string } };
    expect(json.data.id).toBe("100001");
    // 关键断言：where 中应包含 isActive: true
    const callArg = mockStoreFindFirst.mock.calls[0]?.[0] as { where: { isActive?: boolean } };
    expect(callArg.where.isActive).toBe(true);
  });

  it("?all=true 时 admin 拿到下架门店 (isActive 过滤被绕过)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } });
    mockStoreFindFirst.mockResolvedValue(INACTIVE_STORE);
    const GET = await loadGet();
    const res = await GET(
      buildReq("http://localhost/api/stores/100099?all=true"),
      { params: Promise.resolve({ id: "100099" }) } as unknown as Parameters<typeof GET>[1],
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { id: string; isActive: boolean } };
    expect(json.data.isActive).toBe(false);
    // 关键断言：where 中不应包含 isActive: true（admin 跳过过滤）
    const callArg = mockStoreFindFirst.mock.calls[0]?.[0] as { where: { isActive?: boolean } };
    expect(callArg.where.isActive).toBeUndefined();
  });

  it("?all=true 时非 admin 返回 403", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const GET = await loadGet();
    const res = await GET(
      buildReq("http://localhost/api/stores/100099?all=true"),
      { params: Promise.resolve({ id: "100099" }) } as unknown as Parameters<typeof GET>[1],
    );
    expect(res.status).toBe(403);
    expect(mockStoreFindFirst).not.toHaveBeenCalled();
  });

  it("?all=true 未认证返回 403", async () => {
    mockAuth.mockResolvedValue(null);
    const GET = await loadGet();
    const res = await GET(
      buildReq("http://localhost/api/stores/100099?all=true"),
      { params: Promise.resolve({ id: "100099" }) } as unknown as Parameters<typeof GET>[1],
    );
    expect(res.status).toBe(403);
    expect(mockStoreFindFirst).not.toHaveBeenCalled();
  });

  it("下架门店不传 ?all=true 时返回 404", async () => {
    // 默认场景：findFirst 因 isActive:true 过滤返回 null
    mockStoreFindFirst.mockResolvedValue(null);
    const GET = await loadGet();
    const res = await GET(
      buildReq("http://localhost/api/stores/100099"),
      { params: Promise.resolve({ id: "100099" }) } as unknown as Parameters<typeof GET>[1],
    );
    expect(res.status).toBe(404);
  });
});