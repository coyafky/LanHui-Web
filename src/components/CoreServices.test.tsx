import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CoreServices } from "./CoreServices";

describe("CoreServices", () => {
  it("renders section heading", () => {
    render(<CoreServices />);
    expect(screen.getByText("核心服务")).toBeDefined();
  });

  it("renders 4 service cards", () => {
    render(<CoreServices />);
    const cards = screen.getAllByText("了解更多");
    expect(cards).toHaveLength(4);
  });

  it("renders 洗美养护 card with link to /product/car-care", () => {
    render(<CoreServices />);
    const link = screen.getByRole("link", { name: /洗美养护/i });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/product/car-care");
  });

  it("renders updated section description with 一条龙 text", () => {
    render(<CoreServices />);
    const matches = screen.getAllByText(/一条龙/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("renders all 4 original services", () => {
    render(<CoreServices />);
    expect(screen.getByText("轻改方案库")).toBeDefined();
    expect(screen.getByText("车身膜专业服务")).toBeDefined();
    expect(screen.getByText("洗美养护")).toBeDefined();
    expect(screen.getByText("品质与质保")).toBeDefined();
  });
});
