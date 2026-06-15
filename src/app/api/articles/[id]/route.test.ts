import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockAuth, mockLogActivity } = vi.hoisted(() => ({
  mockPrisma: {
    article: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockAuth: vi.fn(),
  mockLogActivity: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));

const CUID = "clxxxxxxxxxxxxxxxxxxxxxxxxx"; // 长度 > 20 且 starts with "cl"
const CUID_ID = "clabcdefghijklmnopqrstuv"; // 24 chars, starts with "cl"
const SLUG_ID = "my-article-slug";
const NONEXISTENT_CUID = "clzzzzzzzzzzzzzzzzzzzzzz";

function buildReq(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/articles/whatever", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function buildDeleteReq(): Request {
  return new Request("http://localhost/api/articles/whatever", {
    method: "DELETE",
  });
}

async function loadRoute() {
  const mod = await import("./route");
  return { GET: mod.GET, PUT: mod.PUT, DELETE: mod.DELETE };
}

const existingArticle = {
  id: CUID_ID,
  title: "Original Title",
  slug: "original-slug",
  content: "# Original\n",
  status: "draft",
  isSticky: false,
  publishedAt: null,
  viewCount: 5,
  author: { id: "user_admin_1", name: "Admin" },
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockPrisma.article.findFirst.mockReset();
  mockPrisma.article.findUnique.mockReset();
  mockPrisma.article.update.mockReset();
  mockPrisma.article.delete.mockReset();
  mockLogActivity.mockReset();
  mockLogActivity.mockResolvedValue(undefined);
});

// =========================================
// GET /api/articles/[id]
// =========================================
describe("GET /api/articles/[id]", () => {
  it("按 cuid id 查询已存在文章 → 200 + author 关联", async () => {
    const publishedArticle = { ...existingArticle, status: "published" };
    mockPrisma.article.findFirst.mockResolvedValue(publishedArticle);
    mockPrisma.article.update.mockResolvedValue({ ...publishedArticle, viewCount: 6 });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { id: string; viewCount: number; author: { id: string } } };
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(CUID_ID);
    expect(json.data.author.id).toBe("user_admin_1");
    // viewCount 在响应中 +1
    expect(json.data.viewCount).toBe(6);
    expect(mockPrisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: CUID_ID } })
    );
    expect(mockPrisma.article.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: CUID_ID },
        data: { viewCount: { increment: 1 } },
      })
    );
  });

  it("按 slug 查询 (id 不以 cl 开头) → 200", async () => {
    mockPrisma.article.findFirst.mockResolvedValue({ ...existingArticle, id: "clrealarticle00000000", slug: SLUG_ID, status: "published" });
    mockPrisma.article.update.mockResolvedValue({ id: "clrealarticle00000000", viewCount: 6 });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: SLUG_ID }) }
    );
    expect(res.status).toBe(200);
    expect(mockPrisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: SLUG_ID } })
    );
  });

  it("文章不存在 → 404 文章不存在", async () => {
    mockPrisma.article.findFirst.mockResolvedValue(null);
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: NONEXISTENT_CUID }) }
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("文章不存在");
    // 不应增加浏览计数
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("草稿文章 + 无 session (public) → 404 (隐藏)", async () => {
    mockAuth.mockResolvedValue(null);
    mockPrisma.article.findFirst.mockResolvedValue({ ...existingArticle, status: "draft" });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("文章不存在");
  });

  it("草稿文章 + admin session → 200 (admin 可看)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findFirst.mockResolvedValue({ ...existingArticle, status: "draft" });
    mockPrisma.article.update.mockResolvedValue({ ...existingArticle, status: "draft", viewCount: 6 });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
  });
});

// =========================================
// PUT /api/articles/[id]
// =========================================
describe("PUT /api/articles/[id] — 鉴权", () => {
  it("无 session → 401 未认证", async () => {
    mockAuth.mockResolvedValue(null);
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ title: "x" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("未认证");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("非 admin/editor 角色 → 403 权限不足", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "viewer" } });
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ title: "x" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("权限不足");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("admin + session.user.id 缺失 → 401 登录状态异常 (不调用 Prisma)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } }); // no id
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ title: "x" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("登录状态异常，请重新登录");
    expect(mockPrisma.article.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });
});

describe("PUT /api/articles/[id] — 业务逻辑", () => {
  it("有效更新 (仅 title) → 200 + data.title 已更新", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique
      .mockResolvedValueOnce(existingArticle) // existing check
      .mockResolvedValueOnce(null); // slug uniqueness check (slug unchanged, no real need, but route always runs it when data.slug exists; with no slug, the branch is skipped)
    mockPrisma.article.update.mockResolvedValue({ ...existingArticle, title: "Updated Title" });
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ title: "Updated Title" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { title: string } };
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("Updated Title");
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({ action: "article.update", entity: "article" })
    );
  });

  it("status: draft → published (无 publishedAt) → 自动 set publishedAt = new Date()", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique.mockResolvedValueOnce({ ...existingArticle, status: "draft", publishedAt: null });
    const fixedDate = new Date("2026-06-15T10:00:00Z");
    vi.setSystemTime(fixedDate);
    let capturedUpdateData: Record<string, unknown> | undefined;
    mockPrisma.article.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
      capturedUpdateData = data;
      return { ...existingArticle, status: "published", publishedAt: fixedDate, ...data };
    });
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ status: "published" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
    expect(capturedUpdateData?.publishedAt).toBeInstanceOf(Date);
    expect((capturedUpdateData?.publishedAt as Date).toISOString()).toBe(fixedDate.toISOString());
    vi.useRealTimers();
  });

  it("isSticky: true → 200 + data.isSticky === true", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique.mockResolvedValueOnce({ ...existingArticle, isSticky: false });
    mockPrisma.article.update.mockResolvedValue({ ...existingArticle, isSticky: true });
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ isSticky: true }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: { isSticky: boolean } };
    expect(json.data.isSticky).toBe(true);
  });

  it("slug 改为已存在 slug → 409 Slug 已存在", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique
      .mockResolvedValueOnce(existingArticle) // existing check
      .mockResolvedValueOnce({ id: "clanotherarticleid00000", slug: "taken-slug" }); // slug uniqueness hit
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ slug: "taken-slug" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Slug 已存在");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("文章不存在 → 404 文章不存在", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique.mockResolvedValueOnce(null);
    const { PUT } = await loadRoute();
    const res = await PUT(
      buildReq({ title: "x" }) as unknown as Parameters<typeof PUT>[0],
      { params: Promise.resolve({ id: NONEXISTENT_CUID }) }
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("文章不存在");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });
});

// =========================================
// DELETE /api/articles/[id]
// =========================================
describe("DELETE /api/articles/[id] — 鉴权", () => {
  it("无 session → 401 未认证", async () => {
    mockAuth.mockResolvedValue(null);
    const { DELETE } = await loadRoute();
    const res = await DELETE(
      buildDeleteReq() as unknown as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("未认证");
    expect(mockPrisma.article.delete).not.toHaveBeenCalled();
  });

  it("editor 角色 → 403 (仅 admin 可删除) 权限不足", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_editor_1", role: "editor" } });
    const { DELETE } = await loadRoute();
    const res = await DELETE(
      buildDeleteReq() as unknown as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("权限不足，仅管理员可删除文章");
    expect(mockPrisma.article.delete).not.toHaveBeenCalled();
  });

  it("admin + session.user.id 缺失 → 401 登录状态异常", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } }); // no id
    const { DELETE } = await loadRoute();
    const res = await DELETE(
      buildDeleteReq() as unknown as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("登录状态异常，请重新登录");
    expect(mockPrisma.article.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.article.delete).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/articles/[id] — 业务逻辑", () => {
  it("删除已存在文章 → 200 + logActivity(article.delete)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique.mockResolvedValueOnce(existingArticle);
    mockPrisma.article.delete.mockResolvedValue(existingArticle);
    const { DELETE } = await loadRoute();
    const res = await DELETE(
      buildDeleteReq() as unknown as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: CUID_ID }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success?: boolean };
    expect(json.success).toBe(true);
    expect(mockPrisma.article.delete).toHaveBeenCalledWith({ where: { id: CUID_ID } });
    expect(mockLogActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "article.delete",
        entity: "article",
        entityId: CUID_ID,
        actorId: "user_admin_1",
      })
    );
  });

  it("文章不存在 → 404 文章不存在", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    mockPrisma.article.findUnique.mockResolvedValueOnce(null);
    const { DELETE } = await loadRoute();
    const res = await DELETE(
      buildDeleteReq() as unknown as Parameters<typeof DELETE>[0],
      { params: Promise.resolve({ id: NONEXISTENT_CUID }) }
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("文章不存在");
    expect(mockPrisma.article.delete).not.toHaveBeenCalled();
  });
});
