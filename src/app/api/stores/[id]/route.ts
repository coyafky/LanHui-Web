import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StoreUpdateSchema } from "@/lib/validations/store";
import { logActivity } from "@/lib/admin-dashboard";
import { generateStoreSlug } from "@/lib/store-slug";

export async function GET(
  request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
  try {
    const { id } = await ctx.params;
    const { searchParams } = request.nextUrl;
    const all = searchParams.get("all") === "true";

    // ?all=true 时要求 admin 权限，用于后台编辑下架门店
    if (all) {
      const session = await auth();
      if (session?.user.role !== "admin") {
        return Response.json(
          { success: false, error: "权限不足" },
          { status: 403 }
        );
      }
    }

    const store = await prisma.store.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        ...(all ? {} : { isActive: true }),
      },
    });

    if (!store) {
      return Response.json(
        { success: false, error: "门店不存在" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: store });
  } catch (error) {
    console.error("[GET /api/stores/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
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

    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = StoreUpdateSchema.safeParse(body);
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

    const existing = await prisma.store.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      return Response.json(
        { success: false, error: "门店不存在" },
        { status: 404 }
      );
    }

    // 当更新涉及省/市 slug 时，校验 DB 并用权威 label 覆盖（AC-5）
    // 两个 slug 都没出现 → 跳过校验，保留原值
    if (parsed.data.provinceSlug || parsed.data.citySlug) {
      const targetProvinceSlug =
        parsed.data.provinceSlug ?? existing.provinceSlug;
      const targetCitySlug = parsed.data.citySlug ?? existing.citySlug;

      const [province, city] = await Promise.all([
        prisma.province.findUnique({ where: { slug: targetProvinceSlug } }),
        prisma.city.findUnique({ where: { slug: targetCitySlug } }),
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

      // 用数据库权威 label 覆盖（AC-5）
      parsed.data.provinceLabel = province.label;
      parsed.data.cityLabel = city.label;
    }

    const store = await prisma.store.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    await logActivity({
      actorId: session.user.id,
      action: "store.update",
      entity: "store",
      entityId: store.id,
      metadata: { name: store.name, slug: store.slug, isActive: store.isActive },
    });

    return Response.json({ success: true, data: store });
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
    console.error("[PUT /api/stores/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
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

    const { id } = await ctx.params;

    const existing = await prisma.store.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      return Response.json(
        { success: false, error: "门店不存在" },
        { status: 404 }
      );
    }

    // Soft delete: set isActive = false
    const store = await prisma.store.update({
      where: { id: existing.id },
      data: { isActive: false },
    });

    await logActivity({
      actorId: session.user.id,
      action: "store.delete",
      entity: "store",
      entityId: existing.id,
      metadata: { name: existing.name, slug: existing.slug },
    });

    return Response.json({ success: true, data: store });
  } catch (error) {
    console.error("[DELETE /api/stores/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stores/[id]
 *
 * 子任务 3 决策:
 *  - 显式拒绝 body 含 `slug` 字段(URL 标识仅在 POST 自动生成 / PATCH 改 name 时联动)
 *  - 联动重生成: name 变化 且 currentStore.status === "pending" → 自动重算 slug
 *  - 接受 `level` 字段更新(StoreUpdateSchema 已含,无需新校验)
 *  - 与 PUT 并存:PUT 保留做向后兼容,后续 admin UI 切换到 PATCH 后可下架 PUT
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
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

    const { id } = await ctx.params;
    const body = await request.json();

    // slug 字段在 PATCH 不允许手动修改
    if ("slug" in body && body.slug !== undefined) {
      return Response.json(
        {
          success: false,
          error: "参数验证失败",
          details: { slug: ["URL 标识不支持手动修改"] },
        },
        { status: 400 }
      );
    }

    const parsed = StoreUpdateSchema.safeParse(body);
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

    const existing = await prisma.store.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });
    if (!existing) {
      return Response.json(
        { success: false, error: "门店不存在" },
        { status: 404 }
      );
    }

    // 当更新涉及省/市 slug 时,校验 DB 并用权威 label 覆盖(AC-5)
    if (parsed.data.provinceSlug || parsed.data.citySlug) {
      const targetProvinceSlug =
        parsed.data.provinceSlug ?? existing.provinceSlug;
      const targetCitySlug = parsed.data.citySlug ?? existing.citySlug;

      const [province, city] = await Promise.all([
        prisma.province.findUnique({ where: { slug: targetProvinceSlug } }),
        prisma.city.findUnique({ where: { slug: targetCitySlug } }),
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

      parsed.data.provinceLabel = province.label;
      parsed.data.cityLabel = city.label;
    }

    // 联动重生成 slug: name 变化 且 status === "pending"
    // 排除 currentStore 自己的 slug,避免和"自己"判重
    if (
      parsed.data.name &&
      parsed.data.name !== existing.name &&
      existing.status === "pending"
    ) {
      const others = await prisma.store.findMany({
        where: { NOT: { id: existing.id } },
        select: { slug: true },
      });
      const existingSlugs = others
        .map((s) => s.slug)
        .filter((s): s is string => Boolean(s));
      parsed.data.slug = generateStoreSlug(parsed.data.name, existingSlugs);
    }

    const store = await prisma.store.update({
      where: { id: existing.id },
      data: parsed.data,
    });

    await logActivity({
      actorId: session.user.id,
      action: "store.update",
      entity: "store",
      entityId: store.id,
      metadata: { name: store.name, slug: store.slug, isActive: store.isActive, level: store.level },
    });

    return Response.json({ success: true, data: store });
  } catch (error) {
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
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      const prismaErr = error as {
        meta?: {
          modelName?: string;
          driverAdapterError?: {
            cause?: { constraint?: { fields?: string[] } };
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
    console.error("[PATCH /api/stores/[id]]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
