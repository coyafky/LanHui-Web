import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorFallback } from "./ErrorFallback";

describe("ErrorFallback", () => {
  const testError = new Error("测试错误信息");
  const mockReset = vi.fn();

  it("显示错误标题", () => {
    render(<ErrorFallback error={testError} reset={mockReset} />);
    expect(screen.getByText("页面出错了")).toBeDefined();
  });

  it("显示重试按钮并响应点击", () => {
    render(<ErrorFallback error={testError} reset={mockReset} />);
    const btn = screen.getByRole("button", { name: /重试/i });
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("显示返回首页链接", () => {
    render(<ErrorFallback error={testError} reset={mockReset} />);
    const link = screen.getByRole("link", { name: /返回首页/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });

  it("admin variant保持功能完整", () => {
    render(<ErrorFallback error={testError} reset={mockReset} variant="admin" />);
    expect(screen.getByRole("button", { name: /重试/i })).toBeDefined();
  });
});
