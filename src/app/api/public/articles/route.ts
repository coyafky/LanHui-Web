import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("search");

  try {
    const where: Record<string, unknown> = { status: "published" };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ isSticky: "desc" }, { publishedAt: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          category: true,
          isSticky: true,
          publishedAt: true,
          viewCount: true,
          author: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return Response.json(
      { success: false, error: "获取文章列表失败" },
      { status: 500 },
    );
  }
}
