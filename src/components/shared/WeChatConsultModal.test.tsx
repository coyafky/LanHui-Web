import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WeChatConsultModal } from "./WeChatConsultModal";

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img
      data-testid="mock-next-image"
      data-src={String(props.src ?? "")}
      data-alt={String(props.alt ?? "")}
    />
  ),
}));

const listeners = vi.hoisted(() => new Set<(open: boolean) => void>());
const mockIsOpen = vi.hoisted(() => ({ current: false }));

vi.mock("@/lib/wechat-modal", () => ({
  subscribeWeChatModal: (listener: (open: boolean) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getWeChatModalState: () => mockIsOpen.current,
  openWeChatModal: () => {
    if (mockIsOpen.current) return;
    mockIsOpen.current = true;
    listeners.forEach((l) => l(true));
  },
  closeWeChatModal: () => {
    if (!mockIsOpen.current) return;
    mockIsOpen.current = false;
    listeners.forEach((l) => l(false));
  },
}));

import { openWeChatModal } from "@/lib/wechat-modal";

describe("WeChatConsultModal", () => {
  beforeEach(() => {
    mockIsOpen.current = false;
    listeners.clear();
  });

  it("默认不渲染弹窗", () => {
    render(<WeChatConsultModal />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("触发 openWeChatModal() 后弹窗出现", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("弹窗展示公众号二维码图片", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    const img = screen.getByTestId("mock-next-image");
    expect(img).toBeDefined();
  });

  it("图片 alt 为蓝辉轻改微信公众号二维码", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    const img = screen.getByTestId("mock-next-image");
    expect(img.getAttribute("data-alt")).toBe("蓝辉轻改微信公众号二维码");
  });

  it("弹窗中不存在 fkycoya", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    expect(screen.queryByText(/fkycoya/i)).toBeNull();
  });

  it("弹窗中不存在 待补充", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    expect(screen.queryByText("待补充")).toBeNull();
  });

  it("弹窗中不存在 微信号:fkycoya", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    expect(screen.queryByText("微信号:fkycoya")).toBeNull();
  });

  it("关闭按钮可用", async () => {
    const user = userEvent.setup();
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    const closeButton = screen.getByRole("button", { name: "关闭" });
    await user.click(closeButton);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("点击遮罩关闭弹窗", async () => {
    const user = userEvent.setup();
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    const dialog = screen.getByRole("dialog");
    await user.click(dialog);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("弹窗标题为配置的公众号标题", () => {
    render(<WeChatConsultModal />);
    act(() => {
      openWeChatModal();
    });
    expect(
      screen.getByRole("heading", { name: "关注蓝辉轻改公众号" }),
    ).toBeDefined();
  });
});
