import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ArticlesPageClient } from "@/components/admin/articles/ArticlesPageClient";
import { ArticleTableSkeleton } from "@/components/admin/articles/ArticleTableSkeleton";

export const metadata: Metadata = {
  title: "文章管理 | 蓝辉轻改管理后台",
};

export default function ArticlesPage() {
  return (
    <Suspense fallback={<ArticleTableSkeleton />}>
      <ArticlesDataWrapper />
    </Suspense>
  );
}

async function ArticlesDataWrapper() {
  const [articles, countResult] = await Promise.all([
    prisma.article.findMany({
      orderBy: [{ isSticky: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        category: true,
        isSticky: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        viewCount: true,
        author: { select: { id: true, name: true } },
      },
    }),
    prisma.article.count(),
  ]);

  const initialArticles = articles.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    status: a.status,
    category: a.category,
    isSticky: a.isSticky,
    publishedAt: a.publishedAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    viewCount: a.viewCount,
    author: { id: a.author.id, name: a.author.name },
  }));

  return (
    <ArticlesPageClient
      initialArticles={initialArticles}
      initialTotal={countResult}
    />
  );
}
