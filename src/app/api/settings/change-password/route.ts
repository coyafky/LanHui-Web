import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChangePasswordSchema } from "@/lib/validations/settings";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "未登录" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = ChangePasswordSchema.safeParse(body);
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
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 });
    }
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, error: "原密码错误" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(parsed.data.newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[POST /api/settings/change-password]", e);
    return NextResponse.json({ success: false, error: "服务器错误" }, { status: 500 });
  }
}
