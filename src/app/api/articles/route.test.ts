import { describe, it, expect, beforeEach, vi } from "vitest";

const mockAuth = vi.hoisted(() => vi.fn());
const mockArticleCreate = vi.hoisted(() => vi.fn());
const mockArticleFindUnique = vi.hoisted(() => vi.fn());
const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    article: {
      create: mockArticleCreate,
      findUnique: mockArticleFindUnique,
    },
  },
}));
vi.mock("@/lib/admin-dashboard", () => ({ logActivity: mockLogActivity }));

const VALID_BODY = {
  title: "demo",
  content: "# demo\n",
  status: "draft",
  isSticky: false,
  tags: [],
  slug: "demo-abc",
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockArticleCreate.mockReset();
  mockArticleFindUnique.mockReset();
  mockLogActivity.mockReset();
  mockArticleFindUnique.mockResolvedValue(null);
  mockArticleCreate.mockImplementation(async ({ data }) => ({
    id: "art_1",
    ...data,
    author: { id: "user_1", name: "Admin" },
  }));
  mockLogActivity.mockResolvedValue(undefined);
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

function buildReq(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/articles", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/articles — 鉴权", () => {
  it("无 session → 401 未认证", async () => {
    mockAuth.mockResolvedValue(null);
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("未认证");
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });

  it("admin 角色 + session.user.id 缺失 → 401 登录状态异常 (不调用 Prisma)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "admin" } }); // no id
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("登录状态异常，请重新登录");
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });

  it("editor 角色 + session.user.id 缺失 → 401 登录状态异常 (不调用 Prisma)", async () => {
    mockAuth.mockResolvedValue({ user: { role: "editor" } });
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(401);
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });

  it("非 admin/editor 角色 → 403 权限不足", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "viewer" } });
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(403);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("权限不足");
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });
});

describe("POST /api/articles — 创建成功路径", () => {
  it("admin + 有效 id + 有效 body → 201 + authorId === session.user.id", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_admin_1", role: "admin" } });
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    expect(mockArticleCreate).toHaveBeenCalledTimes(1);
    const callArg = mockArticleCreate.mock.calls[0]?.[0] as {
      data: { authorId: string; slug: string };
    };
    expect(callArg.data.authorId).toBe("user_admin_1");
    expect(callArg.data.slug).toBe("demo-abc");
    // logActivity called with same id
    expect(mockLogActivity).toHaveBeenCalledTimes(1);
    const activityArg = mockLogActivity.mock.calls[0]?.[0] as { actorId: string };
    expect(activityArg.actorId).toBe("user_admin_1");
  });

  it("editor 角色 + 有效 id + 有效 body → 201 (editor 可创建)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user_editor_1", role: "editor" } });
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(201);
    const callArg = mockArticleCreate.mock.calls[0]?.[0] as { data: { authorId: string } };
    expect(callArg.data.authorId).toBe("user_editor_1");
  });
});

describe("POST /api/articles — 重复 slug", () => {
  it("slug 已存在 → 409 Slug 已存在", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    mockArticleFindUnique.mockResolvedValue({ id: "existing", slug: "demo-abc" });
    const POST = await loadPost();
    const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(409);
    const json = (await res.json()) as { error?: string };
    expect(json.error).toBe("Slug 已存在，请使用其他 Slug");
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });
});

describe("POST /api/articles — 参数验证", () => {
  it("title 缺失 → 400 参数验证失败", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1", role: "admin" } });
    const POST = await loadPost();
    const { title: _t, ...bodyWithoutTitle } = VALID_BODY;
    const res = await POST(buildReq(bodyWithoutTitle) as unknown as Parameters<typeof POST>[0]);
    expect(res.status).toBe(400);
    const json = (await res.json()) as { error?: string; details?: Record<string, string[]> };
    expect(json.error).toBe("参数验证失败");
    expect(json.details?.title).toBeDefined();
    expect(mockArticleCreate).not.toHaveBeenCalled();
  });
});
