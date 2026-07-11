import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const SORT_MAP: Record<string, Prisma.StoreOrderByWithRelationInput> = {
  public_featured: { imagePath: { sort: "asc", nulls: "last" } },
  created_desc: { createdAt: "desc" },
  name_asc: { name: "asc" },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const province = searchParams.get("province");
  const city = searchParams.get("city");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "public_featured";

  try {
    const where: Record<string, unknown> = { status: "active" };
    if (province) where.provinceSlug = province;
    if (city) where.citySlug = city;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { provinceLabel: { contains: search, mode: "insensitive" } },
        { cityLabel: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = SORT_MAP[sort] ?? { createdAt: "desc" };

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: stores,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return Response.json(
      { success: false, error: "获取门店列表失败" },
      { status: 500 },
    );
  }
}
