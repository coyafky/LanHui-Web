import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  ArticleUpdateSchema,
  getIllegalArticleStatusTransitionMessage,
  isArticleStatus,
  validateArticlePublishFields,
} from "@/lib/validations/article";
import { logActivity } from "@/lib/admin-dashboard";
import { requireCsrf } from "@/lib/security/csrf";
import { rateLimiter } from "@/lib/security/rate-limit";

/** GET /api/articles/[id] — 获取单篇文章（也支持按 slug 查询） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 同时按 id 和 slug 查询（cuid 走 id 分支，slug 走 slug 分支）
    // Prisma 7 对 OR 中的非 cuid 格式 id 会静默跳过该分支，不抛 P2023
    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    if (!article) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    // 非管理员只能查看已发布文章
    if (article.status !== "published") {
      const session = await auth();
      if (!session?.user || (session.user.role !== "admin" && session.user.role !== "editor")) {
        return Response.json(
          { success: false, error: "文章不存在" },
          { status: 404 }
        );
      }
    }

    // 增加浏览计数
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return Response.json({
      success: true,
      data: { ...article, viewCount: article.viewCount + 1 },
    });
  } catch (error) {
    console.error("[GET /api/articles/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/** PUT /api/articles/[id] — 更新文章 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { success: false, error: "未认证" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin" && session.user.role !== "editor") {
      return Response.json(
        { success: false, error: "权限不足" },
        { status: 403 }
      );
    }

    if (!session.user.id) {
      return Response.json(
        { success: false, error: "登录状态异常，请重新登录" },
        { status: 401 }
      );
    }

    // CSRF 校验
    const csrf = requireCsrf(request);
    if (!csrf.ok) return csrf.response;

    // 速率限制（60 次/分钟）
    const rl = rateLimiter.check(`route:${session.user.id}`, 60, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "请求过于频繁，请稍后再试", details: { retryAfter: rl.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = ArticleUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const existingStatus = isArticleStatus(existing.status) ? existing.status : "draft";

    // 如果更新了 slug，检查唯一性
    if (data.slug && data.slug !== existing.slug) {
      const slugExists = await prisma.article.findUnique({ where: { slug: data.slug } });
      if (slugExists) {
        return Response.json(
          { success: false, error: "Slug 已存在" },
          { status: 409 }
        );
      }
    }

    // 如果 status 变为 published 且没有 publishedAt，自动设置
    const updateData: Record<string, unknown> = { ...data };
    if (data.status && data.status !== existingStatus) {
      const illegalMessage = getIllegalArticleStatusTransitionMessage(existingStatus, data.status);
      if (illegalMessage) {
        return Response.json(
          { success: false, error: illegalMessage },
          { status: 409 }
        );
      }
      if (data.status === "published") {
        const details = validateArticlePublishFields({
          title: data.title ?? existing.title,
          slug: data.slug ?? existing.slug,
          content: data.content ?? existing.content,
          category: data.category ?? existing.category,
        });
        if (Object.keys(details).length > 0) {
          return Response.json(
            { success: false, error: "发布校验失败", details },
            { status: 400 }
          );
        }
      }
    }
    if (data.status === "published" && !existing.publishedAt && !data.publishedAt) {
      updateData.publishedAt = new Date();
    } else if (data.publishedAt) {
      updateData.publishedAt = new Date(data.publishedAt);
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    await logActivity({
      actorId: session.user.id,
      action: "article.update",
      entity: "article",
      entityId: article.id,
      metadata: { title: article.title, slug: article.slug, status: article.status },
    });

    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);
    if (article.slug !== existing.slug) {
      revalidatePath(`/news/${existing.slug}`);
    }
    revalidatePath("/admin/articles");
    revalidatePath(`/admin/articles/${article.id}`);

    return Response.json({ success: true, data: article });
  } catch (error) {
    console.error("[PUT /api/articles/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/** DELETE /api/articles/[id] — 删除文章（admin 权限，真删除） */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { success: false, error: "未认证" },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return Response.json(
        { success: false, error: "权限不足，仅管理员可删除文章" },
        { status: 403 }
      );
    }

    if (!session.user.id) {
      return Response.json(
        { success: false, error: "登录状态异常，请重新登录" },
        { status: 401 }
      );
    }

    // CSRF 校验
    const csrf = requireCsrf(request);
    if (!csrf.ok) return csrf.response;

    // 速率限制（60 次/分钟）
    const rl = rateLimiter.check(`route:${session.user.id}`, 60, 60_000);
    if (!rl.ok) {
      return Response.json(
        { success: false, error: "请求过于频繁，请稍后再试", details: { retryAfter: rl.retryAfter } },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    await prisma.article.delete({ where: { id } });

    await logActivity({
      actorId: session.user.id,
      action: "article.delete",
      entity: "article",
      entityId: id,
      metadata: { title: existing.title, slug: existing.slug },
    });

    revalidatePath("/news");
    revalidatePath(`/news/${existing.slug}`);
    revalidatePath("/admin/articles");

    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/articles/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
