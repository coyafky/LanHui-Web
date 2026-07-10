let csrfTokenPromise: Promise<string> | null = null;

export async function getAdminCsrfToken(options?: {
  forceRefresh?: boolean;
}): Promise<string> {
  if (!options?.forceRefresh && csrfTokenPromise) {
    return csrfTokenPromise;
  }

  csrfTokenPromise = (async () => {
    const res = await fetch("/api/admin/csrf");
    if (!res.ok) {
      throw new Error(`获取 CSRF token 失败: ${res.status}`);
    }
    const json = await res.json();
    const token: string | undefined = json?.data?.token;
    if (!token) {
      throw new Error("CSRF token 响应格式异常");
    }
    return token;
  })();

  return csrfTokenPromise;
}

export function clearCsrfTokenCache(): void {
  csrfTokenPromise = null;
}

export async function adminCsrfFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  // GET 请求不需要 CSRF token
  if (!init || init.method === undefined || init.method === "GET") {
    return fetch(input, init);
  }

  const method = init.method.toUpperCase();
  if (method === "GET") {
    return fetch(input, init);
  }

  // 获取 CSRF token
  const token = await getAdminCsrfToken();

  // 合并 headers：保留调用方传入的 headers，追加 x-csrf-token
  const existingHeaders = new Headers(init.headers);
  if (!existingHeaders.has("x-csrf-token")) {
    existingHeaders.set("x-csrf-token", token);
  }

  // 自动设置 Content-Type（非 GET 且 body 存在且非 FormData 时）
  const hasBody =
    init.body !== undefined &&
    init.body !== null &&
    !(init.body instanceof FormData);
  if (hasBody && !existingHeaders.has("Content-Type")) {
    existingHeaders.set("Content-Type", "application/json");
  }

  const mergedInit: RequestInit = {
    ...init,
    headers: existingHeaders,
  };

  const response = await fetch(input, mergedInit);

  // 检测 CSRF 失败 → forceRefresh → 重试一次
  if (response.status === 403) {
    try {
      const body = await response.clone().json();
      if (
        body?.error &&
        typeof body.error === "string" &&
        body.error.includes("CSRF")
      ) {
        // 清除缓存，强制刷新 token
        const retryToken = await getAdminCsrfToken({ forceRefresh: true });
        const retryHeaders = new Headers(mergedInit.headers);
        retryHeaders.set("x-csrf-token", retryToken);

        return fetch(input, {
          ...mergedInit,
          headers: retryHeaders,
        });
      }
    } catch {
      // 解析失败则按普通 403 返回
    }
  }

  return response;
}
