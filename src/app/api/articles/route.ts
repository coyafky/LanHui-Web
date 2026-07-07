import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ArticleCreateSchema, validateArticlePublishFields } from "@/lib/validations/article";
import { logActivity } from "@/lib/admin-dashboard";
import { requireCsrf } from "@/lib/security/csrf";
import { rateLimiter } from "@/lib/security/rate-limit";

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
    const slug = data.slug || generateSlug(data.title);
    if (data.status === "published") {
      const details = validateArticlePublishFields({
        title: data.title,
        slug,
        content: data.content,
        category: data.category,
      });
      if (Object.keys(details).length > 0) {
        return Response.json(
          { success: false, error: "发布校验失败", details },
          { status: 400 }
        );
      }
    }

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

    revalidatePath("/news");
    revalidatePath(`/news/${article.slug}`);
    revalidatePath("/admin/articles");

    return Response.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/articles]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
