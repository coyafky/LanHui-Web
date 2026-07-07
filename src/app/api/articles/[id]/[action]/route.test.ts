import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockAuth, mockLogActivity, mockRevalidatePath } = vi.hoisted(() => ({
  mockPrisma: {
    article: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  mockAuth: vi.fn(),
  mockLogActivity: vi.fn(),
  mockRevalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }));
vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }));
vi.mock("@/lib/security/rate-limit", () => ({ rateLimiter: { check: () => ({ ok: true, remaining: 59, limit: 60, resetAt: Date.now() + 60_000 }) } }));

const ARTICLE = {
  id: "cmarticle000000000000000",
  title: "Article",
  slug: "article",
  content: "content",
  category: "新闻",
  status: "draft",
  isSticky: false,
  publishedAt: null,
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockPrisma.article.findUnique.mockReset();
  mockPrisma.article.update.mockReset();
  mockLogActivity.mockReset();
  mockRevalidatePath.mockReset();
  mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

function buildReq(body?: Record<string, unknown>): Request {
  return new Request("http://localhost/api/articles/cmarticle/publish", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("POST /api/articles/[id]/[action]", () => {
  it("publish: draft → published + article.publish log", async () => {
    const fixedDate = new Date("2026-07-04T10:00:00.000Z");
    vi.setSystemTime(fixedDate);
    mockPrisma.article.findUnique.mockResolvedValueOnce(ARTICLE);
    mockPrisma.article.update.mockImplementation(async ({ data }) => ({
      ...ARTICLE,
      ...data,
      status: "published",
      author: { id: "user_admin_1", name: "Admin" },
    }));

    const POST = await loadPost();
    const res = await POST(
      buildReq() as unknown as Parameters<typeof POST>[0],
      { params: Promise.resolve({ id: ARTICLE.id, action: "publish" }) }
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: ARTICLE.id },
        data: { status: "published", publishedAt: fixedDate },
      })
    );
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "article.publish",
        entity: "article",
        entityId: ARTICLE.id,
      })
    );
    expect(mockRevalidatePath).toHaveBeenCalledWith("/news");
    vi.useRealTimers();
  });

  it("withdraw: draft → 409 illegal transition", async () => {
    mockPrisma.article.findUnique.mockResolvedValueOnce(ARTICLE);

    const POST = await loadPost();
    const res = await POST(
      buildReq({ reason: "not ready" }) as unknown as Parameters<typeof POST>[0],
      { params: Promise.resolve({ id: ARTICLE.id, action: "withdraw" }) }
    );

    expect(res.status).toBe(409);
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("publish: archived → 409 illegal transition", async () => {
    mockPrisma.article.findUnique.mockResolvedValueOnce({
      ...ARTICLE,
      status: "archived",
    });

    const POST = await loadPost();
    const res = await POST(
      buildReq() as unknown as Parameters<typeof POST>[0],
      { params: Promise.resolve({ id: ARTICLE.id, action: "publish" }) }
    );

    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toContain("不支持");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("sticky: any status → isSticky true + article.sticky log", async () => {
    mockPrisma.article.findUnique.mockResolvedValueOnce({
      ...ARTICLE,
      status: "withdrawn",
      isSticky: false,
    });
    mockPrisma.article.update.mockResolvedValueOnce({
      ...ARTICLE,
      status: "withdrawn",
      isSticky: true,
    });

    const POST = await loadPost();
    const res = await POST(
      buildReq() as unknown as Parameters<typeof POST>[0],
      { params: Promise.resolve({ id: ARTICLE.id, action: "sticky" }) }
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isSticky: true } })
    );
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ action: "article.sticky" })
    );
  });

  it("viewer role → 403", async () => {
    mockAuth.mockResolvedValue({ user: { id: "viewer_1", role: "viewer" } });
    const POST = await loadPost();
    const res = await POST(
      buildReq() as unknown as Parameters<typeof POST>[0],
      { params: Promise.resolve({ id: ARTICLE.id, action: "publish" }) }
    );
    expect(res.status).toBe(403);
  });
});
