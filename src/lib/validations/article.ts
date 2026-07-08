import { z } from "zod";

export const ARTICLE_STATUSES = [
  "draft",
  "published",
  "withdrawn",
  "archived",
] as const;

export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const ARTICLE_ACTIONS = [
  "publish",
  "withdraw",
  "republish",
  "archive",
  "restore",
  "sticky",
  "unsticky",
] as const;

export type ArticleAction = (typeof ARTICLE_ACTIONS)[number];

export const ARTICLE_ACTION_TARGET: Record<
  ArticleAction,
  { from: readonly ArticleStatus[]; to: ArticleStatus | null; label: string }
> = {
  publish: { from: ["draft"], to: "published", label: "发布" },
  withdraw: { from: ["published"], to: "withdrawn", label: "撤回" },
  republish: { from: ["withdrawn"], to: "published", label: "重新发布" },
  archive: { from: ["draft", "withdrawn"], to: "archived", label: "归档" },
  restore: { from: ["archived"], to: "draft", label: "恢复" },
  sticky: { from: ARTICLE_STATUSES, to: null, label: "置顶" },
  unsticky: { from: ARTICLE_STATUSES, to: null, label: "取消置顶" },
};

const LOCAL_ARTICLE_IMAGE_REGEX = /^\/images\/articles\/[a-zA-Z0-9_-]+\.webp$/;

export function isArticleStatus(input: unknown): input is ArticleStatus {
  return typeof input === "string" && ARTICLE_STATUSES.includes(input as ArticleStatus);
}

export function isArticleAction(input: unknown): input is ArticleAction {
  return typeof input === "string" && ARTICLE_ACTIONS.includes(input as ArticleAction);
}

export function getIllegalArticleStatusTransitionMessage(
  from: ArticleStatus,
  to: ArticleStatus
): string | null {
  if (from === to) return null;
  if (from === "published" && to === "draft") return "已发布文章需先撤回";
  if (from === "archived" && to === "published") return "归档文章需先恢复为草稿";
  if (from === "published" && to === "archived") return "已发布文章需先撤回再归档";
  return null;
}

export function canRunArticleAction(
  action: ArticleAction,
  status: ArticleStatus,
  isSticky: boolean
): boolean {
  if (action === "sticky") return !isSticky;
  if (action === "unsticky") return isSticky;
  return ARTICLE_ACTION_TARGET[action].from.includes(status);
}

export function validateArticlePublishFields(article: {
  title?: string | null;
  slug?: string | null;
  content?: string | null;
  category?: string | null;
}): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  if (!article.title?.trim()) details.title = ["标题不能为空"];
  if (!article.slug?.trim()) details.slug = ["发布前请先设置 Slug"];
  if (!article.content?.trim()) details.content = ["内容不能为空"];
  if (!article.category?.trim()) details.category = ["发布前请选择分类"];
  return details;
}

export const ArticleCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空"),
  slug: z.string().trim().min(1).optional(), // 如果不提供则自动生成
  excerpt: z.string().trim().max(300, "摘要不能超过 300 字").optional().nullable(),
  content: z.string().trim().min(1, "内容不能为空"),
  featuredImage: z
    .string()
    .regex(LOCAL_ARTICLE_IMAGE_REGEX, "封面图路径无效")
    .optional()
    .nullable(),
  category: z.string().trim().min(1, "请选择分类").optional().nullable(),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(ARTICLE_STATUSES).default("draft"),
  isSticky: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const ArticleUpdateSchema = ArticleCreateSchema.partial();
