import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StoreCreateSchema } from "@/lib/validations/store";
import { logActivity } from "@/lib/admin-dashboard";
import { findRegion, findCity } from "@/lib/store-regions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search");
    const all = searchParams.get("all");

    // Only show inactive stores to admins with ?all=true
    let showAll = false;
    if (all === "true") {
      const session = await auth();
      if (session?.user.role === "admin") {
        showAll = true;
      }
    }

    const where: Record<string, unknown> = {};
    if (!showAll) {
      where.isActive = true;
    }
    if (province) {
      where.provinceSlug = province;
    }
    if (city) {
      where.citySlug = city;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.store.count({ where }),
    ]);

    return Response.json({
      success: true,
      data: stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/stores]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return Response.json(
        { success: false, error: "未认证" },
        { status: 401 }
      );
    }
    if (session.user.role !== "admin") {
      return Response.json(
        { success: false, error: "权限不足" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = StoreCreateSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 预校验：省/市必须存在于 store-regions.ts（业务侧维护的合法清单）
    const region = findRegion(parsed.data.provinceSlug);
    if (!region) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { provinceSlug: ["请选择已开通的省份"] },
        },
        { status: 400 }
      );
    }

    const cityResult = findCity(parsed.data.provinceSlug, parsed.data.citySlug);
    if (!cityResult) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { citySlug: ["所选城市暂未开通或不属于所选省份"] },
        },
        { status: 400 }
      );
    }

    // 同步 label（确保 DB label 与 store-regions.ts 一致，避免前端脏数据）
    parsed.data.provinceLabel = region.label;
    parsed.data.cityLabel = cityResult.city.label;

    const store = await prisma.store.create({
      data: {
        ...parsed.data,
        // phoneTel 在 Prisma schema 是必填，schema 改为 optional 后由客户端 useEffect 派生
        phoneTel:
          parsed.data.phoneTel ?? `tel:${parsed.data.phone.replace(/\D/g, "")}`,
      },
    });

    await logActivity({
      actorId: session.user.id,
      action: "store.create",
      entity: "store",
      entityId: store.id,
      metadata: { name: store.name, slug: store.slug },
    });

    return Response.json({ success: true, data: store }, { status: 201 });
  } catch (error) {
    // Prisma P2003 = foreign key constraint violation（兜底：省市被并发删除/被禁用）
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2003"
    ) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { _form: ["省市选择无效，请刷新页面后重试"] },
        },
        { status: 400 }
      );
    }
    // Prisma P2002 = unique constraint violation
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      const target = (error as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("slug")) {
        return Response.json(
          {
            success: false,
            error: "URL标识已存在",
            details: { slug: ["该 URL 标识已被其他门店使用"] },
          },
          { status: 409 }
        );
      }
      return Response.json(
        {
          success: false,
          error: "数据已存在",
          details: { _form: ["记录重复"] },
        },
        { status: 409 }
      );
    }
    console.error("[POST /api/stores]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
