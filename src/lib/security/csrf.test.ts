import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { generateCsrfToken, requireCsrf } from "./csrf";

describe("generateCsrfToken", () => {
  it("生成有效的 UUID 格式字符串", () => {
    const token = generateCsrfToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });

  it("每次调用生成不同的 token", () => {
    const t1 = generateCsrfToken();
    const t2 = generateCsrfToken();
    expect(t1).not.toBe(t2);
  });
});

describe("requireCsrf", () => {
  it("缺少 x-csrf-token header → 返回 ok:false, status 403", async () => {
    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: { cookie: "lanhui_csrf=valid-token-123" },
    });

    const result = requireCsrf(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      const body = await result.response.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("CSRF 校验失败，请刷新页面后重试");
    }
  });

  it("token 与 cookie 不匹配 → 返回 ok:false, status 403", async () => {
    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: {
        cookie: "lanhui_csrf=valid-token-123",
        "x-csrf-token": "different-token-456",
      },
    });

    const result = requireCsrf(request);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      const body = await result.response.json();
      expect(body.success).toBe(false);
    }
  });

  it("token 与 cookie 匹配 → 返回 ok:true", () => {
    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: { "x-csrf-token": "matching-token-789" },
    });

    // Mock cookies.get to simulate happy-dom cookie header filtering
    vi.spyOn(request.cookies, "get").mockReturnValue({
      name: "lanhui_csrf",
      value: "matching-token-789",
    });

    const result = requireCsrf(request);
    expect(result.ok).toBe(true);
  });

  it("cookie 为空时返回 ok:false", () => {
    const request = new NextRequest("http://localhost:3000/api/test", {
      headers: { "x-csrf-token": "some-token" },
    });

    const result = requireCsrf(request);
    expect(result.ok).toBe(false);
  });
});
