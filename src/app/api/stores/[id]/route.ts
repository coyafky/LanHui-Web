import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { StoreUpdateSchema } from "@/lib/validations/store";
import { logActivity } from "@/lib/admin-dashboard";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/stores/[id]">
) {
  try {
    const { id } = await ctx.params;

    const store = await prisma.store.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
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
