import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Store } from "@/lib/store";
import { StoreCard } from "./StoreCard";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img
      data-testid="store-card-image"
      data-src={String(props.src ?? "")}
      data-alt={String(props.alt ?? "")}
      data-fill={props.fill ? "true" : "false"}
      data-sizes={String(props.sizes ?? "")}
      data-placeholder={String(props.placeholder ?? "")}
      className={String(props.className ?? "")}
    />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function createStore(overrides: Partial<Store> = {}): Store {
  return {
    id: "100001",
    name: "蓝辉轻改顺德大良店",
    province: "guangdong",
    provinceLabel: "广东省",
    city: "foshan",
    cityLabel: "佛山市",
    district: "顺德区大良",
    address: "广东省佛山市顺德区大良街道南国中路88号",
    phone: "0757-2288 1001",
    phoneTel: "tel:075722881001",
    businessHours: "09:00-18:00",
    description: "旗舰服务中心",
    level: "flagship",
    isActive: true,
    ...overrides,
  };
}

describe("StoreCard", () => {
  it("有 store.image 时渲染真实门店图片", () => {
    render(<StoreCard store={createStore({ image: "/images/stores/100001.webp" })} />);

    const image = screen.getByTestId("store-card-image");
    expect(image.getAttribute("data-src")).toBe("/images/stores/100001.webp");
    expect(image.getAttribute("data-alt")).toBe("蓝辉轻改顺德大良店 门头实景");
    expect(image.getAttribute("data-fill")).toBe("true");
    expect(image.getAttribute("data-sizes")).toContain("100vw");
    expect(image.getAttribute("data-placeholder")).toBe("blur");
  });

  it("缺少 store.image 时回落到统一门店占位图", () => {
    render(<StoreCard store={createStore({ image: undefined })} />);

    const image = screen.getByTestId("store-card-image");
    expect(image.getAttribute("data-src")).toBe("/images/placeholders/store.webp");
  });
});
