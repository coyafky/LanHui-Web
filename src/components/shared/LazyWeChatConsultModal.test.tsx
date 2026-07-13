import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listeners = vi.hoisted(() => new Set<(open: boolean) => void>());
const mockIsOpen = vi.hoisted(() => ({ current: false }));

vi.mock("next/dynamic", () => ({
  default: (
    _loader: () => Promise<unknown>,
    options?: { loading?: () => React.ReactNode },
  ) =>
    function DynamicComponentStub() {
      return options?.loading?.() ?? null;
    },
}));

vi.mock("@/lib/wechat-modal", () => ({
  subscribeWeChatModal: (listener: (open: boolean) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getWeChatModalState: () => mockIsOpen.current,
  openWeChatModal: () => {
    mockIsOpen.current = true;
    listeners.forEach((listener) => listener(true));
  },
}));

import { openWeChatModal } from "@/lib/wechat-modal";
import { LazyWeChatConsultModal } from "./LazyWeChatConsultModal";

describe("LazyWeChatConsultModal", () => {
  beforeEach(() => {
    mockIsOpen.current = false;
    listeners.clear();
  });

  it("咨询功能未打开时不渲染懒加载占位", () => {
    render(<LazyWeChatConsultModal />);

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("首次打开咨询功能时显示非空白加载反馈", () => {
    render(<LazyWeChatConsultModal />);

    act(() => {
      openWeChatModal();
    });

    expect(
      screen.getByRole("status", { name: "正在打开咨询方式" }),
    ).toBeDefined();
  });
});
