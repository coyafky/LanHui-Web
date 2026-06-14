import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileUpdateSchema } from "@/lib/validations/settings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (e) {
    console.error("[GET /api/settings/profile]", e);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = ProfileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "参数错误",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name, username: parsed.data.username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json(
        { success: false, error: "用户名已被使用" },
        { status: 400 }
      );
    }
    console.error("[PUT /api/settings/profile]", e);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
