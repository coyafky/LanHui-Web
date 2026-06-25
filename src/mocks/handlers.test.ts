/**
 * MSW handlers + fetch 集成测试。
 * 验证 /api/stores 返回结构、过滤、分页、CRUD 全链路。
 */
import { describe, it, expect } from "vitest";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StoreRecord {
  id: string;
  name: string;
  status: "pending" | "active" | "suspended" | "terminated";
  level: "flagship" | "premium" | "specialty" | "member";
  phone: string;
  provinceSlug: string;
  citySlug: string;
  address: string;
}

describe("MSW /api/stores handlers", () => {
  it("GET /api/stores returns paginated success shape", async () => {
    const res = await fetch("/api/stores?page=1&pageSize=5");
    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiResponse<PageResult<StoreRecord>>;
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data!.items.length).toBeLessThanOrEqual(5);
    expect(body.data!.total).toBe(30); // handler 注入 30 条
  });

  it("GET /api/stores supports q filter", async () => {
    const all = await (await fetch("/api/stores?pageSize=100")).json();
    const targetName = all.data.items[0].name;
    const res = await fetch(
      `/api/stores?q=${encodeURIComponent(targetName.slice(0, 4))}&pageSize=100`,
    );
    const body = await res.json();
    expect(body.data.items.length).toBeGreaterThan(0);
    for (const item of body.data.items) {
      const haystack = `${item.name} ${item.address} ${item.slug}`.toLowerCase();
      expect(haystack).toContain(targetName.slice(0, 4).toLowerCase());
    }
  });

  it("GET /api/stores filters by status", async () => {
    const res = await fetch("/api/stores?status=active&pageSize=100");
    const body = (await res.json()) as ApiResponse<PageResult<StoreRecord>>;
    expect(body.data!.items.every((s) => s.status === "active")).toBe(true);
  });

  it("GET /api/stores/:id returns single store or 404", async () => {
    const list = await (await fetch("/api/stores?pageSize=1")).json();
    const id = list.data.items[0].id;
    const res = await fetch(`/api/stores/${id}`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as ApiResponse<StoreRecord>;
    expect(body.data!.id).toBe(id);

    const notFound = await fetch("/api/stores/000000");
    expect(notFound.status).toBe(404);
  });

  it("POST /api/stores creates and returns 201", async () => {
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "新门店",
        provinceSlug: "guangdong",
        citySlug: "foshan",
        phone: "13800138000",
      }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as ApiResponse<StoreRecord>;
    expect(body.success).toBe(true);
    expect(body.data!.name).toBe("新门店");
  });

  it("POST /api/stores validates required fields", async () => {
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "缺省省市的门店" }),
    });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/stores/:id merges fields", async () => {
    const list = await (await fetch("/api/stores?pageSize=1")).json();
    const id = list.data.items[0].id;
    const res = await fetch(`/api/stores/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: "suspended" }),
    });
    const body = (await res.json()) as ApiResponse<StoreRecord>;
    expect(body.data!.status).toBe("suspended");
    // 其它字段保留
    expect(body.data!.id).toBe(id);
  });

  it("DELETE /api/stores/:id returns success then 404", async () => {
    const list = await (await fetch("/api/stores?pageSize=1")).json();
    const id = list.data.items[0].id;
    const del = await fetch(`/api/stores/${id}`, { method: "DELETE" });
    expect(del.status).toBe(200);

    const again = await fetch(`/api/stores/${id}`);
    expect(again.status).toBe(404);
  });

  it("POST /api/analytics/track always succeeds", async () => {
    const res = await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "pageview", path: "/admin/stores" }),
    });
    expect(res.status).toBe(200);
  });
});
