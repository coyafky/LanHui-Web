/**
 * MSW Node server —— vitest 集成入口。
 * 在 vitest.setup.ts 顶部启动，所有 /api/* 请求被拦截。
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
