import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const province = searchParams.get("province");

    const where: Record<string, unknown> = { isActive: true };
    if (province) {
      where.provinceSlug = province;
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { stores: { where: { isActive: true } } },
        },
      },
    });

    const data = cities.map(({ _count, ...city }) => ({
      ...city,
      storeCount: _count.stores,
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/cities]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
