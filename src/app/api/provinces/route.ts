import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

export async function GET(request: Request) {
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
    const ctx = getRequestContext(request, "/api/provinces");
    logger.error({ event: "api.error", ...ctx, error });
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
