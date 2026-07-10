import { describe, it, expect, vi, beforeEach } from "vitest";

const fetchMock = vi.hoisted(() => vi.fn());

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

async function loadModules() {
  const mod = await import("./admin-csrf-fetch");
  return mod;
}

function createJsonResponse(
  status: number,
  body: Record<string, unknown>,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    clone: function () {
      const self = this;
      return {
        ...self,
        json: async () => body,
      };
    },
    headers: new Headers(),
    statusText: status === 403 ? "Forbidden" : "OK",
    redirected: false,
    type: "basic" as ResponseType,
    url: "http://localhost/api/admin/csrf",
    body: null,
    bodyUsed: false,
  } as Response;
}

describe("getAdminCsrfToken", () => {
  it("首次调用请求 /api/admin/csrf 并缓存 token", async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(200, {
        success: true,
        data: { token: "mock-token-1" },
      }),
    );

    const { getAdminCsrfToken, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    const token = await getAdminCsrfToken();
    expect(token).toBe("mock-token-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/admin/csrf");

    // 第二次调用命中缓存，不再次 fetch
    fetchMock.mockClear();
    const token2 = await getAdminCsrfToken();
    expect(token2).toBe("mock-token-1");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forceRefresh 跳过缓存重新请求", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "token-old" },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "token-new" },
        }),
      );

    const { getAdminCsrfToken, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    await getAdminCsrfToken();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const refreshed = await getAdminCsrfToken({ forceRefresh: true });
    expect(refreshed).toBe("token-new");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("adminCsrfFetch", () => {
  it("写请求自动携带 x-csrf-token", async () => {
    fetchMock
      // getAdminCsrfToken 的请求
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "csrf-token" },
        }),
      )
      // 业务请求
      .mockResolvedValueOnce(createJsonResponse(200, { success: true }));

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    await adminCsrfFetch("/api/articles/art-1", {
      method: "POST",
      body: JSON.stringify({ action: "publish" }),
    });

    // 第二次 fetch 应带 CSRF header
    const secondCallHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    expect(secondCallHeaders).toBeDefined();
    expect(secondCallHeaders.get("x-csrf-token")).toBe("csrf-token");
    expect(secondCallHeaders.get("Content-Type")).toBe("application/json");
  });

  it("GET 请求不强制带 CSRF token", async () => {
    fetchMock.mockResolvedValueOnce(createJsonResponse(200, { success: true }));

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    await adminCsrfFetch("/api/articles", { method: "GET" });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 没有额外请求 /api/admin/csrf
    expect(fetchMock).not.toHaveBeenCalledWith("/api/admin/csrf");
  });

  it("403 + body.error 含 CSRF → forceRefresh → 重试一次成功", async () => {
    // 首次 getAdminCsrfToken
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "stale-token" },
        }),
      )
      // 业务请求 403
      .mockResolvedValueOnce(
        createJsonResponse(403, {
          success: false,
          error: "CSRF 校验失败，请刷新页面后重试",
        }),
      )
      // forceRefresh token
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "fresh-token" },
        }),
      )
      // 重试成功
      .mockResolvedValueOnce(createJsonResponse(200, { success: true }));

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    const res = await adminCsrfFetch("/api/articles/art-1", {
      method: "POST",
    });
    expect(res.status).toBe(200);

    // 共 4 次 fetch: 获取 token → 业务 403 → 刷新 token → 重试成功
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const retryHeaders = fetchMock.mock.calls[3][1]?.headers as Headers;
    expect(retryHeaders.get("x-csrf-token")).toBe("fresh-token");
  });

  it("非 CSRF 的 403 不重试", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "my-token" },
        }),
      )
      .mockResolvedValueOnce(
        createJsonResponse(403, {
          success: false,
          error: "权限不足",
        }),
      );

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    const res = await adminCsrfFetch("/api/articles/art-1", {
      method: "DELETE",
    });
    expect(res.status).toBe(403);

    // 只有 2 次 fetch：获取 token → 业务 403（不重试）
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("不覆盖调用方传入的自定义 headers", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "csrf" },
        }),
      )
      .mockResolvedValueOnce(createJsonResponse(200, { success: true }));

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    await adminCsrfFetch("/api/articles/art-1", {
      method: "PUT",
      headers: { "X-Custom": "my-value", "Content-Type": "text/plain" },
      body: JSON.stringify({ title: "test" }),
    });

    const reqHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    expect(reqHeaders.get("X-Custom")).toBe("my-value");
    // 不覆盖调用方设置的 Content-Type
    expect(reqHeaders.get("Content-Type")).toBe("text/plain");
  });

  it("FormData body 不设置 Content-Type", async () => {
    fetchMock
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          success: true,
          data: { token: "csrf" },
        }),
      )
      .mockResolvedValueOnce(createJsonResponse(200, { success: true }));

    const { adminCsrfFetch, clearCsrfTokenCache } = await loadModules();
    clearCsrfTokenCache();

    const formData = new FormData();
    formData.append("key", "value");

    await adminCsrfFetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const reqHeaders = fetchMock.mock.calls[1][1]?.headers as Headers;
    // FormData body → 不应自动添加 application/json Content-Type
    // （浏览器原生 fetch 会设 multipart/form-data + boundary，但 mock 环境下不生效）
    expect(reqHeaders.get("Content-Type")).not.toBe("application/json");
  });
});
