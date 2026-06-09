import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArticleUpdateSchema } from "@/lib/validations/article";

/** GET /api/articles/[id] — 获取单篇文章（也支持按 slug 查询） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 先尝试按 ID 查询，如果 id 不是 cuid 格式则按 slug 查询
    const isCuid = id.startsWith("cl") && id.length > 20;
    const article = await prisma.article.findFirst({
      where: isCuid ? { id } : { slug: id },
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
  _request: NextRequest,
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

    const { id } = await params;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    await prisma.article.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/articles/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
