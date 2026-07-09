import { render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * 共享渲染 helper：动态导入页面组件并渲染。
 * 各 test 文件必须先在自己的模块顶层调用 vi.mock() 完成基础设施 mock，
 * 再调用此 helper。
 */
export async function renderProductPage(importFn: () => Promise<unknown>) {
  const mod = await importFn();
  const Page = (mod as { default: (props: unknown) => ReactNode }).default;
  return render(<Page />);
}

/**
 * 从动态导入的模块中提取 Page 组件的类型。
 * 用法: type PageType = PageComponent<typeof import("./page")>;
 */
export type PageComponent<T extends PromiseLike<unknown>> = T extends PromiseLike<
  infer U
>
  ? U extends { default: infer D }
    ? D
    : never
  : never;
