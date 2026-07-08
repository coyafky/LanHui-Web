import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumbs, BreadcrumbItem } from "@/components/Breadcrumbs";

// Mock next/link to render as <a> so we can assert on href attributes
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: Record<string, unknown>) => (
    <a href={String(href ?? "")} {...rest}>
      {children as React.ReactNode}
    </a>
  ),
}));

describe("Breadcrumbs", () => {
  const defaultItems: BreadcrumbItem[] = [
    { label: "首页", href: "/" },
    { label: "产品中心", href: "/product" },
    { label: "小米 SU7 专属升级方案" },
  ];

  it("renders <nav aria-label='面包屑'> wrapper", () => {
    render(<Breadcrumbs items={defaultItems} />);
    const nav = screen.getByLabelText("面包屑");
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe("NAV");
  });

  it("last item has aria-current='page' attribute", () => {
    render(<Breadcrumbs items={defaultItems} />);
    const lastItem = screen.getByText("小米 SU7 专属升级方案");
    expect(lastItem).toHaveAttribute("aria-current", "page");
  });

  it("intermediate items with href are rendered as links", () => {
    render(<Breadcrumbs items={defaultItems} />);
    const homeLink = screen.getByText("首页");
    expect(homeLink.tagName).toBe("A");
    expect(homeLink).toHaveAttribute("href", "/");

    const productLink = screen.getByText("产品中心");
    expect(productLink.tagName).toBe("A");
    expect(productLink).toHaveAttribute("href", "/product");
  });

  it("last item without href is NOT a link (rendered as <span>)", () => {
    render(<Breadcrumbs items={defaultItems} />);
    const lastItem = screen.getByText("小米 SU7 专属升级方案");
    expect(lastItem.tagName).toBe("SPAN");
    expect(lastItem).not.toHaveAttribute("href");
  });

  it("intermediate item without href renders as span (no aria-current)", () => {
    const items: BreadcrumbItem[] = [
      { label: "首页", href: "/" },
      { label: "中间无链接项" },
      { label: "末项" },
    ];
    render(<Breadcrumbs items={items} />);
    const middleItem = screen.getByText("中间无链接项");
    expect(middleItem.tagName).toBe("SPAN");
    expect(middleItem).not.toHaveAttribute("aria-current");
    expect(middleItem).not.toHaveAttribute("href");
  });

  it("separator elements have aria-hidden='true'", () => {
    const { container } = render(<Breadcrumbs items={defaultItems} />);
    const separators = container.querySelectorAll("svg");
    expect(separators.length).toBeGreaterThan(0);
    separators.forEach((sep) => {
      expect(sep).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("align='center' adds center-justification to the <ol>", () => {
    const { container } = render(
      <Breadcrumbs items={defaultItems} align="center" />,
    );
    const ol = container.querySelector("ol");
    expect(ol?.className).toContain("justify-center");
  });

  it("renders correct number of list items", () => {
    const { container } = render(<Breadcrumbs items={defaultItems} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems).toHaveLength(defaultItems.length);
  });

  it("renders separators between items (count = items.length - 1)", () => {
    const { container } = render(<Breadcrumbs items={defaultItems} />);
    const separators = container.querySelectorAll("svg");
    expect(separators).toHaveLength(defaultItems.length - 1);
  });

  it("returns null for empty items array", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.innerHTML).toBe("");
  });

  it("single item renders no separators and has aria-current", () => {
    const items: BreadcrumbItem[] = [{ label: "首页" }];
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll("svg");
    expect(separators).toHaveLength(0);
    const item = screen.getByText("首页");
    expect(item).toHaveAttribute("aria-current", "page");
  });

  it("applies custom className to nav", () => {
    render(
      <Breadcrumbs items={defaultItems} className="my-custom-class" />,
    );
    const nav = screen.getByLabelText("面包屑");
    expect(nav.className).toContain("my-custom-class");
  });
});
