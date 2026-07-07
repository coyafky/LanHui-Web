import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  it("显示默认加载文案", () => {
    render(<LoadingSpinner />);
    const all = screen.getAllByText("加载中...");
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("显示自定义加载文案", () => {
    render(<LoadingSpinner message="数据加载中，请稍候" />);
    const all = screen.getAllByText("数据加载中，请稍候");
    expect(all.length).toBeGreaterThanOrEqual(1);
  });

  it("渲染动画元素", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
  });

  it("admin variant保持功能完整", () => {
    render(<LoadingSpinner variant="admin" />);
    const all = screen.getAllByText("加载中...");
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
});
