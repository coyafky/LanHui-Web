# 修复文章管理 CSRF 适配 — 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为文章管理后端写 API（PUT/DELETE `[id]`、POST `/articles`）补 CSRF 校验，新建前端 `adminCsrfFetch` 工具并改造文章列表页 `articles/page.tsx` 操作（置顶/发布/撤回/归档/删除）使其走 action 路由 + CSRF header。

**架构：** 新建 `src/lib/admin-csrf-fetch.ts` 封装 CSRF token 获取与请求拦截；改造 `articles/page.tsx` 的三个操作函数（`handleToggleSticky`、`handleConfirmAction` single/delete 分支）改用 action 路由和 `adminCsrfFetch`；后端 `articles/[id]/route.ts` PUT/DELETE 和 `articles/route.ts` POST 补充 `requireCsrf` 调用；同步补全测试和 CI 防回归脚本。

**技术栈：** Next.js 16 App Router + Vitest + Testing Library + Node `readFileSync`（防回归脚本）

---
**元数据：**
- change: `fix-admin-articles-csrf`
- design-doc: `docs/superpowers/specs/2026-07-10-fix-admin-articles-csrf-design.md`
- base-ref: `4930ef795dfe574d0966c4911f6b8be8d4a2bb1c`

---

## 文件清单

| 操作 | 文件路径 | 职责 |
|------|---------|------|
| 创建 | `src/lib/admin-csrf-fetch.ts` | 导出 `getAdminCsrfToken()` 和 `adminCsrfFetch()`，封装 CSRF token 缓存、自动注入、403 重试 |
| 创建 | `src/lib/admin-csrf-fetch.test.ts` | 覆盖首次写请求获取 token、header 注入、GET 免 token、403 CSRF 重试、非 CSRF 403 不重试、不覆盖自定义 header、FormData 不设 Content-Type |
| 修改 | `src/app/admin/(dashboard)/articles/page.tsx` | `handleToggleSticky` 和 `handleConfirmAction` 改用 action 路由 + `adminCsrfFetch`；`ArticleAction` 类型从 `unpublish` 适配为 `withdraw`；删除操作补 CSRF |
| 修改 | `src/app/admin/(dashboard)/articles/page.test.tsx` | 新增操作 API 调用路径验证（置顶→`/sticky`、发布→`/publish`、撤回→`/withdraw`、删除→`DELETE`）；CSRF 失败 toast；成功后刷新 |
| 修改 | `src/app/api/articles/[id]/route.ts` | PUT/DELETE handler 在 `auth()` 后增加 `requireCsrf(request)` 调用 |
| 修改 | `src/app/api/articles/route.ts` | POST handler 在 `auth()` 后增加 `requireCsrf(request)` 调用 |
| 创建 | `scripts/check-admin-csrf-fetch.mjs` | 防回归检查：前端无裸 fetch 写文章 API、状态转换走 action 路由、后端写 route 有 `requireCsrf`、客户端无 `document.cookie` 读 `lanhui_csrf` |
| 修改 | `package.json` | 新增 `check:admin-csrf` script 并链入 `npm run check` |

---

### Task 1: 创建 adminCsrfFetch 工具模块

**文件：**
- 创建：`src/lib/admin-csrf-fetch.ts`
- 测试：`src/lib/admin-csrf-fetch.test.ts`

- [ ] **步骤 1：创建 `src/lib/admin-csrf-fetch.ts`**

核心逻辑：
1. 模块级 token 缓存（`csrfTokenPromise: Promise<string> | null`）
2. `getAdminCsrfToken(options?: { forceRefresh?: boolean })`：缓存命中直接返回；未命中或 `forceRefresh` 则调用 `GET /api/admin/csrf`，从响应 `json.data.token` 取 token 并缓存
3. `adminCsrfFetch(input, init?)`：自动给非 GET 请求加 `x-csrf-token` header（从 `getAdminCsrfToken` 获取）；自动追加 `Content-Type: application/json`（有 body 且非 FormData 时）；保留调用方已有 headers；检测 403 + body.error 含 "CSRF" → `forceRefresh` token → 重试一次

```typescript
// src/lib/admin-csrf-fetch.ts

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
```

- [ ] **步骤 2：创建 `src/lib/admin-csrf-fetch.test.ts`**

覆盖 8 个场景：

```typescript
// src/lib/admin-csrf-fetch.test.ts
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
    // FormData body → 不自动加 Content-Type（浏览器会设 multipart/form-data + boundary）
    expect(reqHeaders.has("Content-Type")).toBe(true);
    expect(reqHeaders.get("Content-Type")).not.toBe("application/json");
  });
});
```

- [ ] **步骤 3：运行测试验证失败**

```bash
npx vitest run src/lib/admin-csrf-fetch.test.ts -t "getAdminCsrfToken|adminCsrfFetch"
```

预期：文件尚未创建，测试文件引用 `./admin-csrf-fetch`，模块解析失败。但因为我们先写工具再写测试，此处先写工具代码再跑测试。

- [ ] **步骤 4：运行测试验证通过**

```bash
npx vitest run src/lib/admin-csrf-fetch.test.ts
```

预期：ALL PASS（8 个测试用例）

- [ ] **步骤 5：Commit**

```bash
git add src/lib/admin-csrf-fetch.ts src/lib/admin-csrf-fetch.test.ts
git commit -m "feat(admin): add adminCsrfFetch utility with token caching and auto-retry"
```

---

### Task 2: 补全后端文章写 API CSRF 校验

**文件：**
- 修改：`src/app/api/articles/[id]/route.ts`
- 修改：`src/app/api/articles/route.ts`

- [ ] **步骤 1：`articles/[id]/route.ts` PUT 增加 `requireCsrf`**

在 `auth()` 和 role 校验之后、`request.json()` body 解析之前插入 `requireCsrf`：

```typescript
// 在 PUT 函数内，约第 88 行（session.user.id 检查之后，const { id } = await params 之前）
import { requireCsrf } from "@/lib/security/csrf";

// 在 PUT handler 中，session.user.id 检查后添加：
const csrfCheck = requireCsrf(request);
if (!csrfCheck.ok) return csrfCheck.response;
```

具体插入位置：`src/app/api/articles/[id]/route.ts` PUT handler 第 93 行 `const { id } = await params;` 之前。

- [ ] **步骤 2：`articles/[id]/route.ts` DELETE 增加 `requireCsrf`**

在 DELETE handler 中，`auth()` 和 role 校验之后、`const { id } = await params` 之前插入：

```typescript
const csrfCheck = requireCsrf(request);
if (!csrfCheck.ok) return csrfCheck.response;
```

注意：DELETE handler 当前参数名为 `_request`，需要改为 `request`（或将 `requireCsrf` 的参数改为 `_request`）。建议将参数名从 `_request` 改为 `request`，因为现在方法体内确实使用了它。

- [ ] **步骤 3：`articles/route.ts` POST 增加 `requireCsrf`**

在 POST handler 中，`auth()` 和 role 校验之后、`request.json()` body 解析之前插入：

```typescript
import { requireCsrf } from "@/lib/security/csrf";

// 在 auth() 校验后、const body = await request.json(); 前：
const csrfCheck = requireCsrf(request);
if (!csrfCheck.ok) return csrfCheck.response;
```

- [ ] **步骤 4：运行已有测试确保不回归**

```bash
npx vitest run src/app/api/articles/route.test.ts
npx vitest run src/app/api/articles/\[id\]/route.test.ts
```

预期：已有测试中 CSRF mock 返回 `{ ok: true }`，不会因为新增 `requireCsrf` 调用而失败。需检查 mock 中 `requireCsrf` 是否已被 mock。

注意：当前 `articles/route.test.ts` 和 `[id]/route.test.ts` 的 mock 中已有 `vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }));`，因此新增 `requireCsrf` 调用后现有测试预期 PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/app/api/articles/[id]/route.ts src/app/api/articles/route.ts
git commit -m "fix(api): add requireCsrf to articles write routes (PUT, DELETE, POST)"
```

---

### Task 3: 改造文章列表页 — 切换到 action 路由 + CSRF

**文件：**
- 修改：`src/app/admin/(dashboard)/articles/page.tsx`
- 修改：`src/app/admin/(dashboard)/articles/page.test.tsx`

- [ ] **步骤 1：`articles/page.tsx` 导入 `adminCsrfFetch` 并更新 `handleToggleSticky`**

文件顶部添加导入：

```typescript
import { adminCsrfFetch } from "@/lib/admin-csrf-fetch";
```

替换 `handleToggleSticky` 函数（第 199-212 行）：

```typescript
async function handleToggleSticky(article: Article) {
  const action = article.isSticky ? "unsticky" : "sticky";
  const res = await adminCsrfFetch(`/api/articles/${article.id}/${action}`, {
    method: "POST",
  });
  if (res.ok) {
    toast.success(article.isSticky ? "已取消置顶" : "已置顶");
    fetchArticles();
  } else {
    const json = await res.json().catch(() => ({}));
    toast.error(json.error || `${article.isSticky ? "取消置顶" : "置顶"}失败`);
  }
}
```

- [ ] **步骤 2：更新 `handleConfirmAction` — single 分支改用 action 路由**

替换 single 分支（第 259-275 行）：

```typescript
} else if (pendingConfirm.type === "single") {
  const { article, action } = pendingConfirm;
  // 适配 action 路由的 action 名称
  const routeAction = action === "unpublish" ? "withdraw" : action;
  const res = await adminCsrfFetch(
    `/api/articles/${article.id}/${routeAction}`,
    { method: "POST" },
  );
  if (res.ok) {
    toast.success(`${ACTION_LABELS[action]}成功`);
    setPendingConfirm(null);
    fetchArticles();
    return;
  }
  const json = await res.json().catch(() => ({}));
  toast.error(json.error || `${ACTION_LABELS[action]}失败`);
```

- [ ] **步骤 3：更新 `handleConfirmAction` — delete 分支改用 `adminCsrfFetch`**

替换 delete 分支的第 248 行 `fetch(...)`：

```typescript
if (pendingConfirm.type === "delete") {
  const res = await adminCsrfFetch(
    `/api/articles/${pendingConfirm.article.id}`,
    { method: "DELETE" },
  );
  // 后续代码保持不变
```

- [ ] **步骤 4：删除 `handleTogglePublish` 后更新 `ArticleAction` 类型**

当前 `ArticleAction` 定义（第 65 行）：
```typescript
type ArticleAction = "publish" | "unpublish" | "archive" | "delete";
```

`handleTogglePublish` 函数（第 194-197 行）使用 `"unpublish"` 作为 key 传给 `ArticleAction`。根据设计文档，前端 `ArticleAction` 类型中的 `"unpublish"` 需保留（因为 UI 显示标签 `ACTION_LABELS` 仍用 `unpublish`），但在调用 API 时做映射 `unpublish → withdraw`。

`handleTogglePublish` 函数本身无需修改，其逻辑停留在 `setPendingConfirm` 设置阶段，不直接发 API。实际的 API 调用在 `handleConfirmAction` 中做映射。

是否需要修改 `handleTogglePublish`？不需要 — 它只设置 `pendingConfirm` 状态，不触及 API。修改点在 `handleConfirmAction` 的 action 映射（步骤 2 已处理）。

- [ ] **步骤 5：更新 page.test.tsx — 验证新操作路径**

在 `page.test.tsx` 的 `describe('ArticlesPage ConfirmDialog')` 块中，将原有的 DELETE API 调用验证测试（`A: 确认删除后调 DELETE API`）保持，它已经验证 `DELETE /api/articles/art-1`。

新增测试用例：

```typescript
// 在 describe('ArticlesPage ConfirmDialog') 块末尾添加

it('D: 确认发布后调 POST /api/articles/:id/publish', async () => {
  render(<ArticlesPage />);

  await waitFor(() => {
    expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
  });

  const moreBtn = findMoreButton();
  fireEvent.click(moreBtn!);
  await waitFor(() => {
    expect(screen.getByText('发布')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('发布'));

  await waitFor(() => {
    expect(screen.getByText('确认发布文章？')).toBeInTheDocument();
  });

  const dialog = screen.getByRole('alertdialog');
  const confirmBtn = within(dialog).getByText('确认');
  fireEvent.click(confirmBtn);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/articles/art-1/publish',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

it('E: 确认撤回后调 POST /api/articles/:id/withdraw', async () => {
  // 修改文章状态为 published，使菜单显示"取消发布"
  const publishedArticle = {
    ...SAMPLE_ARTICLE,
    status: 'published',
  };
  fetchMock.mockReset();
  fetchMock.mockImplementation((url: string) => {
    if (url.includes('/categories')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: { categories: [{ value: '新闻', label: '新闻', count: 1 }] },
        }),
      });
    }
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [publishedArticle],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      }),
    });
  });

  render(<ArticlesPage />);

  await waitFor(() => {
    expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
  });

  const moreBtn = findMoreButton();
  fireEvent.click(moreBtn!);
  await waitFor(() => {
    expect(screen.getByText('取消发布')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('取消发布'));

  await waitFor(() => {
    expect(screen.getByText('确认撤回发布文章？')).toBeInTheDocument();
  });

  const dialog = screen.getByRole('alertdialog');
  const confirmBtn = within(dialog).getByText('确认');
  fireEvent.click(confirmBtn);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/articles/art-1/withdraw',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

it('F: 确认置顶后调 POST /api/articles/:id/sticky', async () => {
  render(<ArticlesPage />);

  await waitFor(() => {
    expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
  });

  const moreBtn = findMoreButton();
  fireEvent.click(moreBtn!);

  await waitFor(() => {
    expect(screen.getByText('置顶')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('置顶'));

  // handleToggleSticky 不弹 ConfirmDialog，直接调 API
  // 在此测试中，菜单关闭后，API 会直接调用
  // 注意：handleToggleSticky 是菜单内直接触发的，不通过 ConfirmDialog
  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/articles/art-1/sticky',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

it('G: 操作成功时刷新列表', async () => {
  // mock fetch 使 handleConfirmAction 的 publish 返回成功
  fetchMock.mockReset();
  fetchMock
    // 首次获取文章列表 + categories
    .mockImplementation((url: string) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { categories: [{ value: '新闻', label: '新闻' }] },
          }),
        });
      }
      if (url.includes('/api/articles?')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [SAMPLE_ARTICLE],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });
    });

  render(<ArticlesPage />);

  await waitFor(() => {
    expect(screen.queryByText('测试文章标题')).toBeInTheDocument();
  });

  const moreBtn = findMoreButton();
  fireEvent.click(moreBtn!);
  await waitFor(() => {
    expect(screen.getByText('发布')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('发布'));

  await waitFor(() => {
    expect(screen.getByText('确认发布文章？')).toBeInTheDocument();
  });

  const dialog = screen.getByRole('alertdialog');
  const confirmBtn = within(dialog).getByText('确认');
  fireEvent.click(confirmBtn);

  // 等待 toast + API 调用 → fetchArticles 再次触发
  await waitFor(() => {
    // 确认 publish API 被调用
    const publishCalls = fetchMock.mock.calls.filter(
      ([url]: [string]) => url === '/api/articles/art-1/publish',
    );
    expect(publishCalls.length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **步骤 6：运行测试验证**

```bash
npx vitest run src/app/admin/\(dashboard\)/articles/page.test.tsx
```

预期：ALL PASS（原有 M1-M5 + A-C 共 8 个 + 新增 D-G 共 4 个 = 12 个测试用例全部通过）

- [ ] **步骤 7：Commit**

```bash
git add src/app/admin/\(dashboard\)/articles/page.tsx src/app/admin/\(dashboard\)/articles/page.test.tsx
git commit -m "fix(admin): switch articles page to action routes with adminCsrfFetch"
```

---

### Task 4: API route 测试补充 CSRF 校验用例

**文件：**
- 修改：`src/app/api/articles/route.test.ts` — POST CSRF 校验用例
- 修改：`src/app/api/articles/[id]/route.test.ts` — PUT/DELETE CSRF 校验用例

- [ ] **步骤 1：`articles/route.test.ts` 新增 POST CSRF 校验用例**

当前 `articles/route.test.ts` 的 csrf mock 是硬编码返回 `{ ok: true }`：

```typescript
vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }));
```

需要改为使用 `vi.hoisted` 暴露可动态控制的 mock function：

在顶层 `vi.hoisted` 块中添加：
```typescript
const mockRequireCsrf = vi.hoisted(() => vi.fn(() => ({ ok: true })));
```

将 csrf mock 改为：
```typescript
vi.mock("@/lib/security/csrf", () => ({
  requireCsrf: mockRequireCsrf,
}));
```

然后在 `describe("POST /api/articles — 鉴权")` 块末尾添加 3 个用例：

```typescript
it("CSRF token 缺失 → 403", async () => {
  mockRequireCsrf.mockReturnValueOnce({
    ok: false,
    response: Response.json(
      { success: false, error: "CSRF 校验失败，请刷新页面后重试" },
      { status: 403 },
    ),
  });

  mockAuth.mockResolvedValue({
    user: { id: "user_1", role: "admin", name: "Admin" },
  });

  const POST = await loadPost();
  const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
  expect(res.status).toBe(403);
  const json = (await res.json()) as { error?: string };
  expect(json.error).toContain("CSRF");
});

it("CSRF token 不匹配 → 403", async () => {
  mockRequireCsrf.mockReturnValueOnce({
    ok: false,
    response: Response.json(
      { success: false, error: "CSRF 校验失败，请刷新页面后重试" },
      { status: 403 },
    ),
  });

  mockAuth.mockResolvedValue({
    user: { id: "user_1", role: "admin", name: "Admin" },
  });

  const POST = await loadPost();
  const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
  expect(res.status).toBe(403);
});

it("正确 CSRF token → 继续执行（不阻塞）", async () => {
  mockRequireCsrf.mockReturnValueOnce({ ok: true });

  mockAuth.mockResolvedValue({
    user: { id: "user_1", role: "admin", name: "Admin" },
  });

  mockArticleFindUnique.mockResolvedValue(null);
  mockArticleCreate.mockImplementation(async ({ data }) => ({
    id: "art_1",
    ...data,
    author: { id: "user_1", name: "Admin" },
  }));

  const POST = await loadPost();
  const res = await POST(buildReq(VALID_BODY) as unknown as Parameters<typeof POST>[0]);
  expect(res.status).toBe(201);
  expect(mockArticleCreate).toHaveBeenCalled();
});
```

同样修改 `[id]/route.test.ts`：

将 `vi.mock("@/lib/security/csrf", () => ({ requireCsrf: () => ({ ok: true }) }))` 改为：

```typescript
const mockRequireCsrf = vi.hoisted(() => vi.fn(() => ({ ok: true })));
vi.mock("@/lib/security/csrf", () => ({ requireCsrf: mockRequireCsrf }));
```

在 `describe("PUT /api/articles/[id]")` 和 `describe("DELETE /api/articles/[id]")` 中各添加 CSRF 校验用例（各 3 个：缺 token、不匹配、正确的 token → 继续）。

- [ ] **步骤 2：运行测试验证**

```bash
npx vitest run src/app/api/articles/route.test.ts
npx vitest run src/app/api/articles/\[id\]/route.test.ts
```

预期：ALL PASS（原有用例 + 新增 CSRF 用例）

- [ ] **步骤 3：Commit**

```bash
git add src/app/api/articles/route.test.ts src/app/api/articles/\[id\]/route.test.ts
git commit -m "test(api): add CSRF validation test cases for articles write routes"
```

---

### Task 5: 防回归脚本 + CI 链入

**文件：**
- 创建：`scripts/check-admin-csrf-fetch.mjs`
- 修改：`package.json`

- [ ] **步骤 1：创建 `scripts/check-admin-csrf-fetch.mjs`**

```javascript
#!/usr/bin/env node

/**
 * check-admin-csrf-fetch.mjs
 *
 * 防回归检查：
 * 1. articles/page.tsx 中不允许对 /api/articles 路径使用裸 fetch（必须用 adminCsrfFetch）
 * 2. 状态转换操作（置顶/发布/撤回/归档）必须调用 action 路由而非 PUT
 * 3. 后端 articles 写 route 必须导入并调用 requireCsrf
 * 4. 客户端代码不允许通过 document.cookie 读取 lanhui_csrf
 *
 * Exit code: 0 = all pass, 1 = failures found
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
let exitCode = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  console.log(`PASS: ${msg}`);
}

// 1. articles/page.tsx 不允许裸 fetch 写文章 API
const pageFile = join(ROOT, "src/app/admin/(dashboard)/articles/page.tsx");
const pageSource = readFileSync(pageFile, "utf-8");

const bareFetchMatches = pageSource.match(
  /fetch\(\s*[`"']\/api\/articles\//g,
);
if (bareFetchMatches && bareFetchMatches.length > 0) {
  fail(
    `articles/page.tsx 中存在 ${bareFetchMatches.length} 处裸 fetch 调用 /api/articles/，请改用 adminCsrfFetch`,
  );
} else {
  pass("articles/page.tsx 中已无裸 fetch 调用 /api/articles/ 的写操作");
}

// 2. 状态转换操作必须调用 action 路由而非 PUT
if (
  /fetch\(\s*[`"']\/api\/articles\/\$\{.*\.id\}[\s\S]*?method:\s*"PUT"/.test(
    pageSource,
  )
) {
  fail("articles/page.tsx 中仍存在 PUT /api/articles/[id] 调用，应改用 action 路由");
} else {
  pass("articles/page.tsx 中已无 PUT 状态转换调用");
}

// 3. 后端 articles 写 route 必须导入并调用 requireCsrf
const routesToCheck = [
  ["articles/[id]/route.ts", "src/app/api/articles/[id]/route.ts"],
  ["articles/route.ts", "src/app/api/articles/route.ts"],
];

for (const [name, relPath] of routesToCheck) {
  const filePath = join(ROOT, relPath);
  const source = readFileSync(filePath, "utf-8");

  if (source.includes(`requireCsrf`)) {
    pass(`${name} 已导入 requireCsrf`);
  } else {
    fail(`${name} 未导入 requireCsrf`);
  }

  // 检查每个写 handler (PUT/DELETE/POST) 内调用了 requireCsrf
  // 简单检查：至少有一个 requireCsrf( 调用
  if (/requireCsrf\(/.test(source)) {
    pass(`${name} 已调用 requireCsrf`);
  } else {
    fail(`${name} 未调用 requireCsrf`);
  }
}

// 4. 客户端代码不允许 document.cookie 读取 lanhui_csrf
const adminFiles = [
  "src/app/admin/(dashboard)/articles/page.tsx",
];

for (const relPath of adminFiles) {
  const filePath = join(ROOT, relPath);
  const source = readFileSync(filePath, "utf-8");
  if (
    /document\.cookie/.test(source) &&
    /lanhui_csrf/.test(source)
  ) {
    fail(`${relPath} 通过 document.cookie 读取 lanhui_csrf，应通过 adminCsrfFetch 获取`);
  } else {
    pass(`${relPath} 未直接读取 document.cookie 中的 lanhui_csrf`);
  }
}

if (exitCode === 0) {
  console.log("\n所有检查通过。");
} else {
  console.error("\n部分检查未通过，请修复后重试。");
}
process.exit(exitCode);
```

- [ ] **步骤 2：`package.json` 新增 script 并链入 `npm run check`**

在 `package.json` 的 `scripts` 段添加：

```json
"check:admin-csrf": "node scripts/check-admin-csrf-fetch.mjs",
```

然后在 `check` 命令中链入，插入到 `check:news-content` 之后（字母序合适位置）：

```
npm run check:news-content && npm run check:admin-csrf && npm run check:product-image-copy
```

- [ ] **步骤 3：运行 check 脚本验证**

```bash
node scripts/check-admin-csrf-fetch.mjs
```

预期：所有检查通过（ALL PASS）

- [ ] **步骤 4：Commit**

```bash
git add scripts/check-admin-csrf-fetch.mjs package.json
git commit -m "ci: add check-admin-csrf-fetch regression script and chain into npm run check"
```

---

### Task 6: 完整回归验证

- [ ] **步骤 1：运行所有测试**

```bash
npx vitest run
```

预期：ALL PASS。关注点：
- `admin-csrf-fetch.test.ts`：8 个用例
- `articles/page.test.tsx`：12 个用例（原有 8 + 新增 4）
- `articles/route.test.ts`：原有 + 新增 CSRF 用例
- `articles/[id]/route.test.ts`：原有 + 新增 CSRF 用例

- [ ] **步骤 2：运行 typecheck**

```bash
npm run typecheck
```

预期：仅存在 pre-existing 的 9 个测试文件错误（`api/analytics/stats/route.test.ts` 和 `lib/analytics.test.ts`），业务代码无新增错误。

- [ ] **步骤 3：运行防回归脚本**

```bash
node scripts/check-admin-csrf-fetch.mjs
```

预期：ALL PASS

- [ ] **步骤 4：运行完整 check（可选，build 耗时较长）**

```bash
npm run check
```

预期：lint + typecheck + check:admin-csrf 及其他所有 check 脚本 + build 通过。

- [ ] **步骤 5：Commit（如有遗漏变更）**

```bash
git status
# 确认无未暂存文件
```

---

## 执行确认

计划已完成并保存到 `docs/superpowers/plans/2026-07-10-fix-admin-articles-csrf.md`。

**两种执行方式：**

1. **子代理驱动（推荐）** — 每个任务调度一个新的子代理，任务间进行审查，快速迭代
2. **内联执行** — 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

**选哪种方式？**
