/**
 * CSRF 防护工具
 *
 * - generateCsrfToken：生成 UUID v4 格式的 token
 * - requireCsrf：从 cookie "lanhui_csrf" 与 header "x-csrf-token" 对比校验
 */

import type { NextRequest } from "next/server";

/** 生成 CSRF token（UUID v4） */
export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

type CsrfOk = { ok: true };
type CsrfFail = { ok: false; response: Response };

type CsrfResult = CsrfOk | CsrfFail;

/**
 * 校验 CSRF token
 *
 * 从 cookie "lanhui_csrf" 读取预期值，与 header "x-csrf-token" 对比。
 * 不匹配或缺失 → 返回 403 + 错误信息。
 */
export function requireCsrf(request: NextRequest): CsrfResult {
  const cookie = request.cookies?.get("lanhui_csrf");
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookie || !headerToken || cookie.value !== headerToken) {
    return {
      ok: false,
      response: Response.json(
        { success: false, error: "CSRF 校验失败，请刷新页面后重试" },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}
