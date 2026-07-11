import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditArticleClient } from "./EditArticleClient";

export const metadata: Metadata = {
  title: "编辑文章 - 蓝辉轻改管理",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const article = await prisma.article.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!article) {
    notFound();
  }

  const initialArticle = {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? undefined,
    content: article.content,
    featuredImage: article.featuredImage ?? undefined,
    category: article.category ?? undefined,
    tags: article.tags,
    status: article.status as import("@/lib/validations/article").ArticleStatus,
    isSticky: article.isSticky,
  };

  return <EditArticleClient initialArticle={initialArticle} id={id} />;
}
