import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("lucide-react", () => ({
  Search: () => <svg data-testid="search-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

import { StoreSearch } from "./StoreSearch";

beforeEach(() => {
  mockPush.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("StoreSearch", () => {
  it("渲染搜索输入框和占位文字", () => {
    render(<StoreSearch />);
    const input = screen.getByPlaceholderText(/输入省份.*搜索/);
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("使用 initialKeyword 作为输入默认值", () => {
    render(<StoreSearch initialKeyword="佛山" />);
    const input = screen.getByPlaceholderText(/输入省份.*搜索/) as HTMLInputElement;
    expect(input.value).toBe("佛山");
  });

  it("无关键词时不显示清空按钮", () => {
    render(<StoreSearch />);
    expect(screen.queryByRole("button", { name: /清空/ })).toBeNull();
  });

  it("有关键词时显示清空按钮", () => {
    render(<StoreSearch initialKeyword="佛山" />);
    expect(screen.getByRole("button", { name: /清空/ })).toBeInTheDocument();
  });

  it("输入后按 Enter 跳转到 /agent?q=xxx", () => {
    render(<StoreSearch />);
    const input = screen.getByPlaceholderText(/输入省份.*搜索/);
    fireEvent.change(input, { target: { value: "佛山" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/agent?q=%E4%BD%9B%E5%B1%B1");
  });

  it("点击清空按钮跳转到 /agent", () => {
    render(<StoreSearch initialKeyword="佛山" />);
    const clearBtn = screen.getByRole("button", { name: /清空/ });
    fireEvent.click(clearBtn);
    expect(mockPush).toHaveBeenCalledWith("/agent");
  });

  it("空输入按 Enter 不跳转", () => {
    render(<StoreSearch />);
    const input = screen.getByPlaceholderText(/输入省份.*搜索/);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
