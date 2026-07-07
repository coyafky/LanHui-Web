import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { generateCsrfToken } from "@/lib/security/csrf";

/**
 * GET /api/admin/csrf
 *
 * 生成 CSRF token 并写入 cookie。
 * 需登录（auth() 校验），未登录返回 401。
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json(
        { success: false, error: "未认证" },
        { status: 401 }
      );
    }

    const token = generateCsrfToken();

    const response = Response.json({
      success: true,
      data: { token },
    });

    response.headers.set(
      "Set-Cookie",
      `lanhui_csrf=${token}; HttpOnly; SameSite=Lax; Path=/`
    );

    return response;
  } catch (error) {
    console.error("[GET /api/admin/csrf]", error);
    return Response.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
