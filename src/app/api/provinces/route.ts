import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: {
            cities: { where: { isActive: true } },
            stores: { where: { isActive: true } },
          },
        },
      },
    });

    const data = provinces.map(({ _count, ...province }) => ({
      ...province,
      cityCount: _count.cities,
      storeCount: _count.stores,
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    console.error("[GET /api/provinces]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
