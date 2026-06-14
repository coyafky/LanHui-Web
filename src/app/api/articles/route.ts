import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArticleCreateSchema } from "@/lib/validations/article";
import { logActivity } from "@/lib/admin-dashboard";

/** 生成简单的 timestamp-based slug */
function generateSlug(title: string): string {
  const timestamp = Date.now().toString(36);
  // 保留 ASCII 字符，移除特殊字符，中文标题直接用时间戳
  const sanitized = title
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 40);
  return sanitized ? `${sanitized}-${timestamp}` : `article-${timestamp}`;
}

/** GET /api/articles — 文章列表 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status");
    const category = searchParams.get("category");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search");

    // 判断是否为管理员
    const session = await auth();
    const isAdmin = session?.user && (session.user.role === "admin" || session.user.role === "editor");

    const where: Record<string, unknown> = {};

    // 公开 GET 只返回 published；Admin 可返回所有状态
    if (!isAdmin) {
      where.status = "published";
    } else if (statusParam) {
      where.status = statusParam;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [
          { isSticky: "desc" },
          { publishedAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/articles]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/** POST /api/articles — 创建文章 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = ArticleCreateSchema.safeParse(body);
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

    // 自动生成 slug
    const slug = data.slug || generateSlug(data.title);

    // 确保 slug 唯一
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      return Response.json(
        { success: false, error: "Slug 已存在，请使用其他 Slug" },
        { status: 409 }
      );
    }

    // 如果 status 是 published 且没有 publishedAt，自动设置
    const publishedAt = data.status === "published" && !data.publishedAt
      ? new Date()
      : data.publishedAt
        ? new Date(data.publishedAt)
        : null;

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        featuredImage: data.featuredImage,
        category: data.category,
        tags: data.tags,
        status: data.status,
        isSticky: data.isSticky,
        publishedAt,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    await logActivity({
      actorId: session.user.id,
      action: "article.create",
      entity: "article",
      entityId: article.id,
      metadata: { title: article.title, slug: article.slug },
    });

    return Response.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/articles]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
