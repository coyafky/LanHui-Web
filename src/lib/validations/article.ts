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
