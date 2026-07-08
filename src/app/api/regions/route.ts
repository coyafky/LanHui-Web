import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getRequestContext } from "@/lib/request-context";

export type RegionTreeCity = {
  slug: string;
  label: string;
  code: string | null;
  type: string | null;
};

export type RegionTreeNode = {
  slug: string;
  label: string;
  code: string | null;
  type: string | null;
  cities: RegionTreeCity[];
};

export async function GET(request: Request) {
  try {
    const provinces = await prisma.province.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        cities: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    const data: RegionTreeNode[] = provinces.map((p) => ({
      slug: p.slug,
      label: p.label,
      code: p.code,
      type: p.type,
      cities: p.cities.map((c) => ({
        slug: c.slug,
        label: c.label,
        code: c.code,
        type: c.type,
      })),
    }));

    return Response.json({ success: true, data });
  } catch (error) {
    const ctx = getRequestContext(request, "/api/regions");
    logger.error({ event: "api.error", ...ctx, error });
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}