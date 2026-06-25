/**
 * MSW 浏览器 worker 启动器 —— 在 dev 环境 (NEXT_PUBLIC_API_MOCKING=enabled) 启动，
 * 让前端组件无需 DB 也能渲染列表 / 表单。
 *
 * 启动方式：在客户端入口处判断 env 后调 `worker.start()`。
 *
 * 注意：MSW 的 `setupWorker` 调用 browser-only API（如 ServiceWorkerRegistration），
 * 在 Node 端 (vitest) 顶层求值会炸。所以本模块仅在 `typeof window !== 'undefined'`
 * 时实例化 worker；Node 端请改用 `@/mocks/node` 的 `server`。
 */
import type { SetupWorker } from "msw/browser";
import { handlers } from "./handlers";

let workerInstance: SetupWorker | null = null;

export async function startBrowserMocks(): Promise<SetupWorker | null> {
  if (typeof window === "undefined") return null;
  if (workerInstance) return workerInstance;
  const { setupWorker } = await import("msw/browser");
  workerInstance = setupWorker(...handlers);
  await workerInstance.start({
    onUnhandledRequest: "bypass",
  });
  return workerInstance;
}

/** 暴露 handlers 给浏览器端点（供 ClientProvider 之类按需启用）。 */
export { handlers };
