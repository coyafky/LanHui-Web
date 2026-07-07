import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

const mockAuth = vi.hoisted(() => vi.fn());
const mockStoreFindFirst = vi.hoisted(() => vi.fn());
const mockStoreUpdate = vi.hoisted(() => vi.fn());
const mockArticleFindUnique = vi.hoisted(() => vi.fn());
const mockArticleUpdate = vi.hoisted(() => vi.fn());
const mockFsMkdir = vi.hoisted(() => vi.fn());
const mockFsAccess = vi.hoisted(() => vi.fn());
const mockFsUnlink = vi.hoisted(() => vi.fn());
const mockFsWriteFile = vi.hoisted(() => vi.fn());
const mockFsRename = vi.hoisted(() => vi.fn());
const mockSharp = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ auth: mockAuth }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    store: {
      findFirst: mockStoreFindFirst,
      update: mockStoreUpdate,
    },
    article: {
      findUnique: mockArticleFindUnique,
      update: mockArticleUpdate,
    },
  },
}));
vi.mock("node:fs", () => ({
  default: {
    promises: {
      mkdir: mockFsMkdir,
      access: mockFsAccess,
      unlink: mockFsUnlink,
      writeFile: mockFsWriteFile,
      rename: mockFsRename,
    },
  },
  promises: {
    mkdir: mockFsMkdir,
    access: mockFsAccess,
    unlink: mockFsUnlink,
    writeFile: mockFsWriteFile,
    rename: mockFsRename,
  },
}));
vi.mock("sharp", () => ({ default: mockSharp }));
vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }));
vi.mock("@/lib/security/rate-limit", () => ({ rateLimiter: { check: () => ({ ok: true, remaining: 9, limit: 10, resetAt: Date.now() + 60_000 }) } }));

const STORE = {
  id: "store_real_1",
  slug: "shunde-daliang",
  imagePath: null,
};

const ARTICLE = {
  id: "article_1",
  title: "轻改案例",
  featuredImage: "/images/articles/article_1.webp",
};

beforeEach(() => {
  vi.resetModules();
  mockAuth.mockReset();
  mockStoreFindFirst.mockReset();
  mockStoreUpdate.mockReset();
  mockArticleFindUnique.mockReset();
  mockArticleUpdate.mockReset();
  mockFsMkdir.mockReset();
  mockFsAccess.mockReset();
  mockFsUnlink.mockReset();
  mockFsWriteFile.mockReset();
  mockFsRename.mockReset();
  mockSharp.mockReset();

  mockAuth.mockResolvedValue({ user: { id: "admin_1", role: "admin" } });
  mockStoreFindFirst.mockResolvedValue(STORE);
  mockStoreUpdate.mockResolvedValue({
    ...STORE,
    imagePath: "/images/stores/store_real_1.webp",
  });
  mockArticleFindUnique.mockResolvedValue(ARTICLE);
  mockArticleUpdate.mockResolvedValue(ARTICLE);
  mockFsMkdir.mockResolvedValue(undefined);
  mockFsAccess.mockRejectedValue(new Error("not found"));
  mockFsUnlink.mockResolvedValue(undefined);
  mockFsWriteFile.mockResolvedValue(undefined);
  mockFsRename.mockResolvedValue(undefined);
  mockSharp.mockImplementation(() => ({
    metadata: vi.fn().mockResolvedValue({
      format: "jpeg",
      width: 1440,
      height: 960,
    }),
    webp: vi.fn().mockReturnValue({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from("processed-webp")),
    }),
  }));
});

async function loadPost() {
  const mod = await import("./route");
  return mod.POST;
}

async function loadDelete() {
  const mod = await import("./route");
  return mod.DELETE;
}

function buildUploadReq(entity: "store" | "article", entityId: string): Request {
  const formData = new FormData();
  formData.append(
    "file",
    new File(["fake image"], `${entity}.jpg`, { type: "image/jpeg" })
  );
  formData.append("entity", entity);
  formData.append("entityId", entityId);

  return new Request("http://localhost/api/upload", {
    method: "POST",
    body: formData,
  });
}

describe("POST /api/upload", () => {
  it("使用 slug 上传门店图片时，路径与数据库更新统一使用真实 store.id", async () => {
    const POST = await loadPost();
    const res = await POST(buildUploadReq("store", "shunde-daliang") as Parameters<typeof POST>[0]);

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      success: boolean;
      data: { path: string; width: number; height: number };
    };
    expect(json.success).toBe(true);
    expect(json.data.path).toBe("/images/stores/store_real_1.webp");
    expect(json.data.width).toBe(1440);
    expect(json.data.height).toBe(960);

    expect(mockStoreFindFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: "shunde-daliang" }, { slug: "shunde-daliang" }] },
    });
    expect(mockStoreUpdate).toHaveBeenCalledWith({
      where: { id: "store_real_1" },
      data: { imagePath: "/images/stores/store_real_1.webp" },
    });
    expect(mockFsRename).toHaveBeenCalledWith(
      expect.stringContaining("/public/images/stores/store_real_1.webp."),
      expect.stringContaining("/public/images/stores/store_real_1.webp")
    );
  });

  it("允许 editor 上传文章封面图并更新 featuredImage", async () => {
    mockAuth.mockResolvedValue({ user: { id: "editor_1", role: "editor" } });

    const POST = await loadPost();
    const res = await POST(buildUploadReq("article", "article_1") as Parameters<typeof POST>[0]);

    expect(res.status).toBe(201);
    const json = (await res.json()) as {
      success: boolean;
      data: { path: string; width: number; height: number };
    };
    expect(json.success).toBe(true);
    expect(json.data.path).toBe("/images/articles/article_1.webp");
    expect(json.data.width).toBe(1440);
    expect(json.data.height).toBe(960);

    expect(mockArticleFindUnique).toHaveBeenCalledWith({
      where: { id: "article_1" },
    });
    expect(mockArticleUpdate).toHaveBeenCalledWith({
      where: { id: "article_1" },
      data: { featuredImage: "/images/articles/article_1.webp" },
    });
    expect(mockFsRename).toHaveBeenCalledWith(
      expect.stringContaining("/public/images/articles/article_1.webp."),
      expect.stringContaining("/public/images/articles/article_1.webp")
    );
  });

  it("保持 store 上传 admin-only，editor 会被拒绝", async () => {
    mockAuth.mockResolvedValue({ user: { id: "editor_1", role: "editor" } });

    const POST = await loadPost();
    const res = await POST(buildUploadReq("store", "shunde-daliang") as Parameters<typeof POST>[0]);

    expect(res.status).toBe(403);
    const json = (await res.json()) as { success: boolean; error: string };
    expect(json.success).toBe(false);
    expect(json.error).toBe("权限不足");
    expect(mockStoreFindFirst).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/upload", () => {
  it("删除文章封面图时只删除 /images/articles/ 下文件并清空 featuredImage", async () => {
    mockAuth.mockResolvedValue({ user: { id: "editor_1", role: "editor" } });

    const DELETE = await loadDelete();
    const req = new NextRequest("http://localhost/api/upload?entity=article&entityId=article_1");
    const res = await DELETE(req as Parameters<typeof DELETE>[0]);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { path: string | null } };
    expect(json.success).toBe(true);
    expect(json.data.path).toBeNull();

    expect(mockFsUnlink).toHaveBeenCalledWith(
      expect.stringContaining("/public/images/articles/article_1.webp")
    );
    expect(mockArticleUpdate).toHaveBeenCalledWith({
      where: { id: "article_1" },
      data: { featuredImage: null },
    });
  });

  it("使用 slug 删除门店图片时，仍使用真实 store.id 清空 imagePath", async () => {
    mockStoreFindFirst.mockResolvedValue({
      ...STORE,
      imagePath: "/images/stores/store_real_1.webp",
    });

    const DELETE = await loadDelete();
    const req = new NextRequest("http://localhost/api/upload?entity=store&entityId=shunde-daliang");
    const res = await DELETE(req as Parameters<typeof DELETE>[0]);

    expect(res.status).toBe(200);
    const json = (await res.json()) as { success: boolean; data: { path: string | null } };
    expect(json.success).toBe(true);
    expect(json.data.path).toBeNull();

    expect(mockStoreFindFirst).toHaveBeenCalledWith({
      where: { OR: [{ id: "shunde-daliang" }, { slug: "shunde-daliang" }] },
    });
    expect(mockStoreUpdate).toHaveBeenCalledWith({
      where: { id: "store_real_1" },
      data: { imagePath: null },
    });
  });
});
