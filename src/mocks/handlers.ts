/**
 * MSW request handlers —— 在测试 / 浏览器 dev 中拦截 /api/* 请求，
 * 返回由 faker fixtures 生成的随机数据，让组件/页面可以在无 DB 环境下渲染。
 *
 * 设计：
 *   - 默认返回 200 + 成功结构，匹配项目 `{ success: boolean, data?: T, error?: string }` 响应。
 *   - 边界用例：400/401/403/500 通过 `?status=` query 显式触发（`msw` 测试自己的边界时用）。
 *   - handler 不持久化；如需「在 handler 间共享状态」用 `db` 变量（in-memory store）。
 */
import { http, HttpResponse, delay } from "msw";
import {
  mockStore,
  mockStoreList,
  type StoreFixture,
} from "@/lib/test-utils/fixtures";

/** 进程内门店 store —— 单测用，生产代码不会调这里。 */
const db = {
  stores: new Map<string, StoreFixture>(),
};

/** 简单分页 + 过滤 + 排序，匹配真实 /api/stores GET 行为。 */
interface ListQuery {
  q?: string;
  status?: string;
  level?: string;
  hasImage?: string;
  page?: string;
  pageSize?: string;
  sort?: string;
  order?: string;
}

function filterStores(query: ListQuery): StoreFixture[] {
  let list = Array.from(db.stores.values());
  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q),
    );
  }
  if (query.status && query.status !== "all") {
    list = list.filter((s) => s.status === query.status);
  }
  if (query.level && query.level !== "all") {
    list = list.filter((s) => s.level === query.level);
  }
  if (query.hasImage === "true") {
    list = list.filter((s) => s.imagePath !== null);
  } else if (query.hasImage === "false") {
    list = list.filter((s) => s.imagePath === null);
  }
  if (query.sort) {
    const desc = query.order === "desc";
    list = [...list].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[query.sort!];
      const bv = (b as unknown as Record<string, unknown>)[query.sort!];
      if (av === bv) return 0;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      return (av > bv ? 1 : -1) * (desc ? -1 : 1);
    });
  }
  return list;
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * 注入种子数据 —— 第一次 handler 被访问时按需填充。
 * 数量与状态分布模拟真实业务（6 active / 2 pending / 1 suspended / 1 terminated）。
 */
function ensureSeeded() {
  if (db.stores.size > 0) return;
  const list = mockStoreList(30);
  for (const s of list) db.stores.set(s.id, s);
}

export const handlers = [
  // ─── /api/stores ───
  http.get("/api/stores", async ({ request }) => {
    await delay(150);
    ensureSeeded();
    const url = new URL(request.url);
    const q: ListQuery = Object.fromEntries(url.searchParams.entries());
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize) || 20));
    const filtered = filterStores(q);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result });
  }),

  http.get("/api/stores/:id", async ({ params }) => {
    await delay(100);
    ensureSeeded();
    const store = db.stores.get(String(params.id));
    if (!store) {
      return HttpResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: store });
  }),

  http.post("/api/stores", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Partial<StoreFixture>;
    if (!body.name || !body.provinceSlug || !body.citySlug) {
      return HttpResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }
    const id = String(Date.now()).slice(-6);
    const created = mockStore({ id, ...body });
    db.stores.set(id, created);
    return HttpResponse.json({ success: true, data: created }, { status: 201 });
  }),

  http.patch("/api/stores/:id", async ({ params, request }) => {
    await delay(150);
    const store = db.stores.get(String(params.id));
    if (!store) {
      return HttpResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Partial<StoreFixture>;
    const updated = { ...store, ...body, id: store.id };
    db.stores.set(store.id, updated);
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete("/api/stores/:id", async ({ params }) => {
    await delay(120);
    const existed = db.stores.delete(String(params.id));
    if (!existed) {
      return HttpResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true });
  }),

  // ─── /api/analytics/track ───
  http.post("/api/analytics/track", async () => {
    await delay(50);
    return HttpResponse.json({ success: true });
  }),
];

/** 测试辅助：重置 in-memory 状态。每个测试前调用一次避免污染。 */
export function resetMockDb() {
  db.stores.clear();
}
