import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  ArticleCreateSchema,
  ArticleUpdateSchema,
  ArticleFormSchema,
  ARTICLE_STATUSES,
  LOCAL_ARTICLE_IMAGE_REGEX,
  validateArticleForm,
} from "@/lib/validations/article";

describe("ARTICLE_STATUSES", () => {
  it("包含 draft / published / archived", () => {
    expect(ARTICLE_STATUSES).toEqual(["draft", "published", "archived"]);
  });
});

describe("LOCAL_ARTICLE_IMAGE_REGEX", () => {
  it("匹配 /images/articles/*.webp", () => {
    expect(LOCAL_ARTICLE_IMAGE_REGEX.test("/images/articles/foo.webp")).toBe(
      true,
    );
    expect(
      LOCAL_ARTICLE_IMAGE_REGEX.test("/images/articles/my-article.webp"),
    ).toBe(true);
    expect(
      LOCAL_ARTICLE_IMAGE_REGEX.test("/images/articles/article_123.webp"),
    ).toBe(true);
  });

  it("拒绝其他路径", () => {
    expect(LOCAL_ARTICLE_IMAGE_REGEX.test("/uploads/images/foo.webp")).toBe(
      false,
    );
    expect(LOCAL_ARTICLE_IMAGE_REGEX.test("/images/articles/foo.png")).toBe(
      false,
    );
    expect(
      LOCAL_ARTICLE_IMAGE_REGEX.test("https://example.com/img.webp"),
    ).toBe(false);
  });
});

describe("ArticleFormSchema", () => {
  const validData = {
    title: "测试文章标题",
    content: "<p>文章内容</p>",
    status: "draft" as const,
    isSticky: false,
    tags: ["标签1", "标签2"],
  };

  it("接受合法输入", () => {
    const result = ArticleFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe("title", () => {
    it("拒绝空标题", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        title: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.title?.[0]).toBe(
          "标题不能为空",
        );
      }
    });

    it("拒绝 undefined", () => {
      const { title: _unused, ...rest } = validData;
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe("slug", () => {
    it("接受 undefined", () => {
      const { slug: _unused, ...rest } = { ...validData, slug: undefined };
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it("接受 null", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: null,
      });
      expect(result.success).toBe(true);
    });

    it("接受空字符串", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: "",
      });
      expect(result.success).toBe(true);
    });

    it("接受合法 slug", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: "my-article-2026",
      });
      expect(result.success).toBe(true);
    });

    it("拒绝含大写字母的 slug", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: "My-Article",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.slug?.[0]).toBe(
          "只允许小写字母、数字、短横线",
        );
      }
    });

    it("拒绝含空格的 slug", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: "my article",
      });
      expect(result.success).toBe(false);
    });

    it("拒绝含中文的 slug", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        slug: "我的文章",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("excerpt", () => {
    it("接受 undefined", () => {
      const { excerpt: _unused, ...rest } = { ...validData, excerpt: undefined };
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it("接受 null", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        excerpt: null,
      });
      expect(result.success).toBe(true);
    });

    it("接受空字符串", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        excerpt: "",
      });
      expect(result.success).toBe(true);
    });

    it("拒绝超过 300 字的摘要", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        excerpt: "x".repeat(301),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.excerpt?.[0]).toBe(
          "摘要不能超过 300 字",
        );
      }
    });

    it("接受正好 300 字的摘要", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        excerpt: "x".repeat(300),
      });
      expect(result.success).toBe(true);
    });
  });

  describe("content", () => {
    it("拒绝空内容", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        content: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.content?.[0]).toBe(
          "内容不能为空",
        );
      }
    });

    it("拒绝 undefined", () => {
      const { content: _unused, ...rest } = validData;
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe("featuredImage", () => {
    it("接受 undefined", () => {
      const { featuredImage: _unused, ...rest } = {
        ...validData,
        featuredImage: undefined,
      };
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it("接受 null", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        featuredImage: null,
      });
      expect(result.success).toBe(true);
    });

    it("接受空字符串", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        featuredImage: "",
      });
      expect(result.success).toBe(true);
    });

    it("接受合法的图片路径", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        featuredImage: "/images/articles/cover.webp",
      });
      expect(result.success).toBe(true);
    });

    it("拒绝非法图片路径", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        featuredImage: "/uploads/cover.jpg",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.featuredImage?.[0]).toBe(
          "封面图路径无效",
        );
      }
    });

    it("拒绝外部 URL 图片路径", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        featuredImage: "https://example.com/image.webp",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.featuredImage?.[0]).toBe(
          "封面图路径无效",
        );
      }
    });
  });

  describe("category", () => {
    it("接受 undefined", () => {
      const { category: _unused, ...rest } = { ...validData, category: undefined };
      void _unused;
      const result = ArticleFormSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });

    it("接受 null", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        category: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("tags", () => {
    it("去重并去空格", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        tags: [" 标签1 ", "标签2", " 标签1 "],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(["标签1", "标签2"]);
      }
    });

    it("过滤空标签", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        tags: ["标签1", "", "  "],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(["标签1"]);
      }
    });
  });

  describe("status", () => {
    it("接受 draft", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "draft",
      });
      expect(result.success).toBe(true);
    });

    it("接受 published（需附带分类）", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "published",
        category: "改装案例",
      });
      expect(result.success).toBe(true);
    });

    it("接受 archived", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "archived",
      });
      expect(result.success).toBe(true);
    });

    it("拒绝非法状态", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "deleted",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("isSticky", () => {
    it("接受 true", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        isSticky: true,
      });
      expect(result.success).toBe(true);
    });

    it("接受 false", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        isSticky: false,
      });
      expect(result.success).toBe(true);
    });

    it("拒绝非布尔值", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        isSticky: "true",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("superRefine: published without category", () => {
    it("published 状态下无 category 时报错", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "published",
        category: null,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.category?.[0]).toBe(
          "发布前请选择分类",
        );
      }
    });

    it("published 状态下 category 为空字符串时报错", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "published",
        category: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.category?.[0]).toBe(
          "发布前请选择分类",
        );
      }
    });

    it("published 状态下有 category 时通过", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "published",
        category: "改装案例",
      });
      expect(result.success).toBe(true);
    });

    it("draft 状态下无 category 时不报错", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "draft",
        category: null,
      });
      expect(result.success).toBe(true);
    });

    it("archived 状态下无 category 时不报错", () => {
      const result = ArticleFormSchema.safeParse({
        ...validData,
        status: "archived",
        category: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

describe("validateArticleForm", () => {
  const validData = {
    title: "测试文章标题",
    content: "<p>文章内容</p>",
    status: "draft" as const,
    isSticky: false,
    tags: ["标签1"],
  };

  it("返回 valid: true 当输入合法", () => {
    const result = validateArticleForm(validData);
    expect(result).toEqual({ valid: true, fieldErrors: {} });
  });

  it("返回 fieldErrors 当校验失败", () => {
    const result = validateArticleForm({ ...validData, title: "" });
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.title).toBe("标题不能为空");
  });

  it("只返回每个字段的第一个错误", () => {
    const result = validateArticleForm({
      ...validData,
      title: "",
      content: "",
    });
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.title).toBe("标题不能为空");
    expect(result.fieldErrors.content).toBe("内容不能为空");
  });

  it("published 无 category 时报错", () => {
    const result = validateArticleForm({
      ...validData,
      status: "published",
      category: null,
    });
    expect(result.valid).toBe(false);
    expect(result.fieldErrors.category).toBe("发布前请选择分类");
  });
});

describe("ArticleCreateSchema stays unmodified", () => {
  it("仍然接受合法创建数据", () => {
    const result = ArticleCreateSchema.safeParse({
      title: "新文章",
      content: "<p>内容</p>",
    });
    expect(result.success).toBe(true);
  });
});

describe("ArticleUpdateSchema stays unmodified", () => {
  it("partial 更新仍可用", () => {
    const result = ArticleUpdateSchema.safeParse({ title: "新标题" });
    expect(result.success).toBe(true);
  });
});
