/**
 * MSW 统一入口 —— 浏览器按需启动，Node (vitest) 走 server。
 *
 * 用法：
 *   // 浏览器（"use client" 组件里）
 *   if (process.env.NEXT_PUBLIC_API_MOCKING === "enabled") {
 *     const { startBrowserMocks } = await import("@/mocks");
 *     await startBrowserMocks();
 *   }
 *
 *   // Node (vitest.setup.ts)
 *   import { server, resetMockDb } from "@/mocks";
 *   server.listen();
 *   afterEach(() => resetMockDb());
 *   afterAll(() => server.close());
 */
export { handlers, resetMockDb } from "./handlers";
export { server } from "./node";
export { startBrowserMocks } from "./browser";
