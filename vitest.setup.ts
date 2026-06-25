import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server, resetMockDb } from "@/mocks";

/**
 * 启动 MSW Node server —— 所有 /api/* 请求被 handlers 拦截。
 * 任何测试无需额外配置即可用 faker 数据。
 */
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

/** 每个测试后重置 in-memory mock db，避免状态污染。 */
afterEach(() => {
  resetMockDb();
});

/** 全局关闭。 */
afterAll(() => {
  server.close();
});
