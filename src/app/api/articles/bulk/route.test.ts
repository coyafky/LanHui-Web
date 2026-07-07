import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockAuth, mockLogActivity, mockRevalidatePath } = vi.hoisted(() => ({
  mockPrisma: {
    article: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

const draftArticle = {
  id: "art_draft",
  title: "Draft",
  slug: "draft",
  content: "content",
  category: "新闻",
  status: "draft",
  isSticky: false,
  publishedAt: null,
};

const publishedArticle = {
  ...draftArticle,
  id: "art_published",
  slug: "published",
  status: "published",
  publishedAt: new Date("2026-07-01T00:00:00.000Z"),
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockPrisma.article.findUnique.mockReset();
  mockPrisma.article.update.mockReset();
  mockPrisma.article.delete.mockReset();
  mockLogActivity.mockReset();
  mockRevalidatePath.mockReset();
  mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

function buildReq(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/articles/bulk", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/articles/bulk", () => {
  it("admin only: editor → 403", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_editor_1", role: "editor" } });
    const POST = await loadPost();
    const res = await POST(
      buildReq({ action: "publish", ids: ["art_draft"] }) as unknown as Parameters<typeof POST>[0]
    );
    expect(res.status).toBe(403);
    expect(mockPrisma.article.findUnique).not.toHaveBeenCalled();
  });

  it("publish mixed ids → succeeded/skipped/failed summary", async () => {
    mockPrisma.article.findUnique
      .mockResolvedValueOnce(draftArticle)
      .mockResolvedValueOnce(publishedArticle)
      .mockResolvedValueOnce(null);
    mockPrisma.article.update.mockImplementation(async ({ data }) => ({
      ...draftArticle,
      ...data,
      status: "published",
    }));

    const POST = await loadPost();
    const res = await POST(
      buildReq({
        action: "publish",
        ids: ["art_draft", "art_published", "missing"],
        reason: "batch",
      }) as unknown as Parameters<typeof POST>[0]
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      data: {
        requested: number;
        succeeded: Array<{ id: string }>;
        skipped: Array<{ id: string }>;
        failed: Array<{ id: string }>;
      };
    };
    expect(json.data.requested).toBe(3);
    expect(json.data.succeeded).toEqual([expect.objectContaining({ id: "art_draft" })]);
    expect(json.data.skipped).toEqual([expect.objectContaining({ id: "art_published" })]);
    expect(json.data.failed).toEqual([expect.objectContaining({ id: "missing" })]);
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ action: "article.publish", entityId: "art_draft" })
    );
  });

  it("delete → deletes each existing article and logs article.delete", async () => {
    mockPrisma.article.findUnique.mockResolvedValueOnce(draftArticle);
    mockPrisma.article.delete.mockResolvedValueOnce(draftArticle);

    const POST = await loadPost();
    const res = await POST(
      buildReq({ action: "delete", ids: ["art_draft"] }) as unknown as Parameters<typeof POST>[0]
    );

    expect(res.status).toBe(200);
    expect(mockPrisma.article.delete).toHaveBeenCalledWith({ where: { id: "art_draft" } });
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ action: "article.delete", entityId: "art_draft" })
    );
  });

  it("invalid body → 400", async () => {
    const POST = await loadPost();
    const res = await POST(
      buildReq({ action: "publish", ids: [] }) as unknown as Parameters<typeof POST>[0]
    );
    expect(res.status).toBe(400);
  });
});
