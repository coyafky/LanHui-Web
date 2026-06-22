import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StoreCreateSchema } from "@/lib/validations/store";
import { logActivity } from "@/lib/admin-dashboard";
import { generateStoreSlug } from "@/lib/store-slug";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const province = searchParams.get("province");
    const city = searchParams.get("city");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const search = searchParams.get("search");
    const all = searchParams.get("all");
    // 多值筛选：?level=flagship&level=premium
    const levels = searchParams.getAll("level");
    // 旧 API 兼容：?isActive=true/false — 派生为 status / isActive 过滤
    const isActiveParam = searchParams.get("isActive");

    // Only show inactive stores to admins with ?all=true
    let showAll = false;
    if (all === "true") {
      const session = await auth();
      if (session?.user.role === "admin") {
        showAll = true;
      }
    }

    const where: Record<string, unknown> = {};
    if (!showAll && isActiveParam === null) {
      // 默认只展示 active（兼容旧调用方），显式 ?isActive=false 时一起覆盖
      where.isActive = true;
    }
    if (isActiveParam === "true") {
      where.isActive = true;
    } else if (isActiveParam === "false") {
      where.isActive = false;
    }
    if (province) {
      where.provinceSlug = province;
    }
    if (city) {
      where.citySlug = city;
    }
    if (levels.length > 0) {
      // Prisma schema 的 level 字段是 enum,直接用 in
      where.level = { in: levels };
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

    // 预校验：省/市必须存在于数据库且 active（AC-5：用 DB label 覆盖客户端）
    const [province, city] = await Promise.all([
      prisma.province.findUnique({ where: { slug: parsed.data.provinceSlug } }),
      prisma.city.findUnique({ where: { slug: parsed.data.citySlug } }),
    ]);

    if (!province || !province.isActive) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { provinceSlug: ["请选择已开通的省份"] },
        },
        { status: 400 }
      );
    }
    if (!city || !city.isActive || city.provinceSlug !== province.slug) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { citySlug: ["所选城市暂未开通或不属于所选省份"] },
        },
        { status: 400 }
      );
    }

    // 用数据库权威 label 覆盖客户端传来的值（AC-5：不信任客户端 label）
    // 此时 provinceLabel/cityLabel 已为非空 string，但 zod 推导仍是 optional
    // 所以用强制断言向下传递，Prisma schema 要求这两个字段必填非空
    //
    // slug 自动生成：客户端可手填也可省略；
    //   - 传了非空值：尊重（管理后台手填场景）
    //   - 未传/空串/纯空白：基于 name + 现有 slug 列表自动生成
    let slug: string | null = parsed.data.slug?.trim() || null;
    if (!slug) {
      const existing = await prisma.store.findMany({ select: { slug: true } });
      const existingSlugs = existing
        .map((s) => s.slug)
        .filter((s): s is string => Boolean(s));
      slug = generateStoreSlug(parsed.data.name, existingSlugs);
    }

    const finalData = {
      ...parsed.data,
      provinceLabel: province.label,
      cityLabel: city.label,
      // phoneTel 在 Prisma schema 是必填，schema 改为 optional 后由客户端 useEffect 派生
      phoneTel:
        parsed.data.phoneTel ?? `tel:${parsed.data.phone.replace(/\D/g, "")}`,
      slug,
    };

    const store = await prisma.store.create({
      data: finalData,
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
      // Prisma 7 + Driver Adapter 抛出新结构 P2002 error：
      //   { code: "P2002", meta: { driverAdapterError: { cause: { constraint: { fields: ["slug"] } } } } }
      // 旧 Prisma ≤ 6 用 `meta.target`，保留兜底以防御未来回滚。
      const prismaErr = error as {
        meta?: {
          modelName?: string;
          driverAdapterError?: {
            cause?: {
              originalCode?: string;
              kind?: string;
              constraint?: { fields?: string[] };
            };
          };
          target?: string[];
        };
      };
      const fields =
        prismaErr.meta?.driverAdapterError?.cause?.constraint?.fields ??
        prismaErr.meta?.target;
      if (fields?.includes("slug")) {
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
