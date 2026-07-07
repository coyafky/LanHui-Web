import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/admin-dashboard";
import {
  ARTICLE_ACTION_TARGET,
  canRunArticleAction,
  isArticleAction,
  isArticleStatus,
  validateArticlePublishFields,
  type ArticleAction,
  type ArticleStatus,
} from "@/lib/validations/article";
import { requireCsrf } from "@/lib/security/csrf";
import { rateLimiter } from "@/lib/security/rate-limit";

type ActionBody = {
  reason?: string;
};

function parseReason(input: unknown): string | null {
  return typeof input === "string" && input.trim() ? input.trim() : null;
}

async function readBody(request: NextRequest): Promise<ActionBody> {
  try {
    return (await request.json()) as ActionBody;
  } catch {
    return {};
  }
}

function revalidateArticlePaths(article: { id: string; slug: string }) {
  revalidatePath("/news");
  revalidatePath(`/news/${article.slug}`);
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${article.id}`);
}

function getUpdateData(
  action: ArticleAction,
  article: { status: ArticleStatus; isSticky: boolean; publishedAt?: Date | null }
) {
  if (action === "sticky") return { isSticky: true };
  if (action === "unsticky") return { isSticky: false };

  const target = ARTICLE_ACTION_TARGET[action].to;
  const data: Record<string, unknown> = { status: target };
  if ((action === "publish" || action === "republish") && !article.publishedAt) {
    data.publishedAt = new Date();
  }
  return data;
}

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string; action: string }> }
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

    const { id, action: actionParam } = await ctx.params;
    if (!isArticleAction(actionParam)) {
      return Response.json(
        { success: false, error: "未知的文章动作" },
        { status: 400 }
      );
    }

    const body = await readBody(request);
    const reason = parseReason(body.reason);
    if (body.reason && typeof body.reason === "string" && body.reason.length > 500) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { reason: ["原因不能超过 500 字"] },
        },
        { status: 400 }
      );
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return Response.json(
        { success: false, error: "文章不存在" },
        { status: 404 }
      );
    }

    const currentStatus = isArticleStatus(existing.status) ? existing.status : "draft";
    if (!canRunArticleAction(actionParam, currentStatus, existing.isSticky)) {
      return Response.json(
        {
          success: false,
          error: `当前状态「${currentStatus}」不支持「${ARTICLE_ACTION_TARGET[actionParam].label}」`,
        },
        { status: 409 }
      );
    }

    if (actionParam === "publish" || actionParam === "republish") {
      const details = validateArticlePublishFields(existing);
      if (Object.keys(details).length > 0) {
        return Response.json(
          { success: false, error: "发布校验失败", details },
          { status: 400 }
        );
      }
    }

    const article = await prisma.article.update({
      where: { id: existing.id },
      data: getUpdateData(actionParam, {
        status: currentStatus,
        isSticky: existing.isSticky,
        publishedAt: existing.publishedAt,
      }),
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });

    await logActivity({
      actorId: session.user.id,
      action: `article.${actionParam}`,
      entity: "article",
      entityId: article.id,
      metadata: {
        from: currentStatus,
        to: actionParam === "sticky" || actionParam === "unsticky" ? currentStatus : article.status,
        title: article.title,
        slug: article.slug,
        reason,
      },
    });

    revalidateArticlePaths(article);

    return Response.json({ success: true, data: article });
  } catch (error) {
    console.error("[POST /api/articles/[id]/[action]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
