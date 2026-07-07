import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/admin-dashboard";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";
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

type BulkAction = ArticleAction | "delete";

type BulkBody = {
  action?: unknown;
  ids?: unknown;
  reason?: unknown;
};

type BulkItem = {
  id: string;
  action: BulkAction;
  from?: string;
  to?: string;
  reason?: string;
  error?: string;
};

function isBulkAction(input: unknown): input is BulkAction {
  return input === "delete" || isArticleAction(input);
}

function parseReason(input: unknown): string | null {
  return typeof input === "string" && input.trim() ? input.trim() : null;
}

function getUpdateData(
  action: ArticleAction,
  article: { publishedAt?: Date | null }
) {
  if (action === "sticky") return { isSticky: true };
  if (action === "unsticky") return { isSticky: false };

  const data: Record<string, unknown> = {
    status: ARTICLE_ACTION_TARGET[action].to,
  };
  if ((action === "publish" || action === "republish") && !article.publishedAt) {
    data.publishedAt = new Date();
  }
  return data;
}

function revalidateArticlePaths(article?: { id: string; slug: string }) {
  revalidatePath("/news");
  revalidatePath("/admin/articles");
  if (article) {
    revalidatePath(`/news/${article.slug}`);
    revalidatePath(`/admin/articles/${article.id}`);
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
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
        { success: false, error: "权限不足，仅管理员可批量操作文章" },
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

    const body = (await request.json().catch(() => ({}))) as BulkBody;
    if (!isBulkAction(body.action)) {
      return Response.json(
        { success: false, error: "未知的批量动作" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.ids) ||
      body.ids.length === 0 ||
      body.ids.some((id) => typeof id !== "string" || !id.trim())
    ) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { ids: ["ids 必须是非空字符串数组"] },
        },
        { status: 400 }
      );
    }

    if (typeof body.reason === "string" && body.reason.length > 500) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { reason: ["原因不能超过 500 字"] },
        },
        { status: 400 }
      );
    }

    const action = body.action;
    const requested = body.ids.length;
    const ids = Array.from(new Set(body.ids.map((id) => id.trim())));
    const reason = parseReason(body.reason);
    const succeeded: BulkItem[] = [];
    const skipped: BulkItem[] = [];
    const failed: BulkItem[] = [];

    for (const id of ids) {
      try {
        const existing = await prisma.article.findUnique({ where: { id } });
        if (!existing) {
          failed.push({ id, action, error: "文章不存在" });
          continue;
        }

        const currentStatus: ArticleStatus = isArticleStatus(existing.status)
          ? existing.status
          : "draft";

        if (action === "delete") {
          await prisma.article.delete({ where: { id: existing.id } });
          await logActivity({
            actorId: session.user.id,
            action: "article.delete",
            entity: "article",
            entityId: existing.id,
            metadata: { title: existing.title, slug: existing.slug, reason },
          });
          revalidateArticlePaths(existing);
          succeeded.push({ id, action, from: currentStatus, reason: reason ?? undefined });
          continue;
        }

        if (!canRunArticleAction(action, currentStatus, existing.isSticky)) {
          skipped.push({
            id,
            action,
            from: currentStatus,
            error: `当前状态「${currentStatus}」不支持「${ARTICLE_ACTION_TARGET[action].label}」`,
          });
          continue;
        }

        if (action === "publish" || action === "republish") {
          const details = validateArticlePublishFields(existing);
          if (Object.keys(details).length > 0) {
            failed.push({ id, action, from: currentStatus, error: "发布校验失败" });
            continue;
          }
        }

        const article = await prisma.article.update({
          where: { id: existing.id },
          data: getUpdateData(action, { publishedAt: existing.publishedAt }),
        });
        const toStatus = action === "sticky" || action === "unsticky"
          ? currentStatus
          : String(article.status);

        await logActivity({
          actorId: session.user.id,
          action: `article.${action}`,
          entity: "article",
          entityId: article.id,
          metadata: {
            from: currentStatus,
            to: toStatus,
            title: article.title,
            slug: article.slug,
            reason,
          },
        });

        revalidateArticlePaths(article);
        succeeded.push({
          id,
          action,
          from: currentStatus,
          to: toStatus,
          reason: reason ?? undefined,
        });
      } catch (error) {
        failed.push({
          id,
          action,
          error: error instanceof Error ? error.message : "操作失败",
        });
      }
    }

    if (succeeded.length > 0) {
      revalidateArticlePaths();
    }

    const bulkCtx = getRequestContext(request, "/api/articles/bulk");
    logger.info({
      event: "api.request.completed",
      ...bulkCtx,
      status: 200,
      durationMs: Date.now() - start,
      userId: session.user.id,
    });

    return Response.json({
      success: true,
      data: {
        requested,
        succeeded,
        skipped,
        failed,
      },
    });
  } catch (error) {
    const bulkErrCtx = getRequestContext(request, "/api/articles/bulk");
    logger.error({
      event: "api.request.failed",
      ...bulkErrCtx,
      status: 500,
      durationMs: Date.now() - start,
      userId: undefined,
      error,
    });
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
