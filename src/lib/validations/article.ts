import { z } from "zod";

export const ArticleCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1).optional(), // 如果不提供则自动生成
  excerpt: z.string().optional(),
  content: z.string().min(1, "内容不能为空"),
  featuredImage: z.string().url().optional().nullable(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  isSticky: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
});

export const ArticleUpdateSchema = ArticleCreateSchema.partial();

// 客户端表单校验 — 与 ArticleCreateSchema 独立，提供更友好的错误提示
export const ARTICLE_STATUSES = ["draft", "published", "archived"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export const LOCAL_ARTICLE_IMAGE_REGEX = /^\/images\/articles\/[\w-]+\.webp$/;

export const ArticleFormSchema = z
  .object({
    title: z.string().min(1, "标题不能为空"),
    slug: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          val === undefined || val === null || val === "" || /^[a-z0-9-]*$/.test(val),
        "只允许小写字母、数字、短横线",
      ),
    excerpt: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => !val || val.length <= 300,
        { message: "摘要不能超过 300 字" },
      ),
    content: z.string().min(1, "内容不能为空"),
    featuredImage: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          val === undefined ||
          val === null ||
          val === "" ||
          LOCAL_ARTICLE_IMAGE_REGEX.test(val),
        "封面图路径无效",
      ),
    category: z.string().optional().nullable(),
    tags: z
      .array(z.string())
      .transform((tags) => [
        ...new Set(tags.map((t) => t.trim()).filter(Boolean)),
      ]),
    status: z.enum(ARTICLE_STATUSES),
    isSticky: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published" && !data.category?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "发布前请选择分类",
        path: ["category"],
      });
    }
  });

export type ArticleFormInput = z.infer<typeof ArticleFormSchema>;

export function validateArticleForm(
  input: ArticleFormInput,
): {
  valid: boolean;
  fieldErrors: Partial<Record<keyof ArticleFormInput, string>>;
} {
  const result = ArticleFormSchema.safeParse(input);
  if (result.success) {
    return { valid: true, fieldErrors: {} };
  }

  const fieldErrors: Partial<Record<keyof ArticleFormInput, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof ArticleFormInput;
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return { valid: false, fieldErrors };
}
