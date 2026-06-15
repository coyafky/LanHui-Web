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
      expect.objectContaining({
        where: { OR: expect.arrayContaining([{ id: CUID_ID }, { slug: CUID_ID }]) },
      })
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
      expect.objectContaining({
        where: { OR: expect.arrayContaining([{ id: SLUG_ID }, { slug: SLUG_ID }]) },
      })
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

  // ===== 回归测试：真实 Prisma cuid 格式（cm 前缀）=====
  // 真实数据：cmq7f2na60000oig6vigpzqll, cmq7f2nac0001oig65aprfskm
  // bug 根因：旧 isCuid 检查写的是 startsWith("cl")，对 cm 开头的真实 cuid 永远 false
  it("[回归] 真实格式 cuid (cm 前缀) → 200 + data.id 匹配", async () => {
    const REAL_CUID = "cmq7f2na60000oig6vigpzqll";
    const article = { ...existingArticle, id: REAL_CUID, status: "published" };
    mockPrisma.article.findFirst.mockResolvedValue(article);
    mockPrisma.article.update.mockResolvedValue({ ...article, viewCount: article.viewCount + 1 });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: REAL_CUID }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { id: string } };
    expect(json.success).toBe(true);
    expect(json.data.id).toBe(REAL_CUID);
    // OR 查询应同时尝试 id 和 slug 两路
    expect(mockPrisma.article.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ id: REAL_CUID }, { slug: REAL_CUID }] },
      })
    );
  });

  it("[回归] slug 格式 id (不以 cl/cm 开头) → 200 + author 关联", async () => {
    const SLUG = "brand-website-launch";
    const article = { ...existingArticle, id: "cmrealarticleid00000000", slug: SLUG, status: "published" };
    mockPrisma.article.findFirst.mockResolvedValue(article);
    mockPrisma.article.update.mockResolvedValue({ ...article, viewCount: article.viewCount + 1 });
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: SLUG }) }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { id: string; author: { id: string } } };
    expect(json.success).toBe(true);
    expect(json.data.author.id).toBe("user_admin_1");
  });

  it("不存在的 id (任意格式) → 404 + 文章不存在", async () => {
    const GHOST_ID = "cmghost00000000000000000";
    mockPrisma.article.findFirst.mockResolvedValue(null);
    const { GET } = await loadRoute();
    const res = await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: GHOST_ID }) }
    );
    expect(res.status).toBe(404);
    const json = (await res.json()) as { success: boolean; error?: string };
    expect(json.success).toBe(false);
    expect(json.error).toBe("文章不存在");
    expect(mockPrisma.article.update).not.toHaveBeenCalled();
  });

  it("[OR 验证] 真实 cuid 调用 findFirst 时 where 为 OR 数组", async () => {
    const REAL_CUID = "cmq7f2nac0001oig65aprfskm";
    const article = { ...existingArticle, id: REAL_CUID, status: "published" };
    mockPrisma.article.findFirst.mockResolvedValue(article);
    mockPrisma.article.update.mockResolvedValue(article);
    const { GET } = await loadRoute();
    await GET(
      buildReq({}) as unknown as Parameters<typeof GET>[0],
      { params: Promise.resolve({ id: REAL_CUID }) }
    );
    // 验证调用形状：OR 数组应同时含 id 和 slug 分支
    const callArg = mockPrisma.article.findFirst.mock.calls[0]?.[0] as
      | { where: { OR: Array<Record<string, string>> } }
      | undefined;
    expect(callArg).toBeDefined();
    expect(callArg?.where.OR).toHaveLength(2);
    expect(callArg?.where.OR[0]).toEqual({ id: REAL_CUID });
    expect(callArg?.where.OR[1]).toEqual({ slug: REAL_CUID });
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
