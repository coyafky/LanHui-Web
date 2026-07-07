import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFoundContent } from "./NotFoundContent";

describe("NotFoundContent", () => {
  it("显示 404 标题", () => {
    render(<NotFoundContent />);
    expect(screen.getByText("404")).toBeDefined();
  });

  it("显示返回首页链接（public）", () => {
    render(<NotFoundContent />);
    const link = screen.getByRole("link", { name: /返回首页/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });

  it("显示常见导航链接（public）", () => {
    render(<NotFoundContent />);
    expect(screen.getByRole("link", { name: /产品中心/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /门店网络/i })).toBeDefined();
  });

  it("admin area显示返回仪表盘链接", () => {
    render(<NotFoundContent area="admin" />);
    const link = screen.getByRole("link", { name: /返回仪表盘/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/admin");
  });
});
