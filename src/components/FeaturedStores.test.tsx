/**
 * FeaturedStores RSC tests (TDD RED→GREEN)
 *
 * 覆盖任务 3 验收点：
 *  - 调用 getStores({ limit: 4, sort: "public_featured" })
 *  - 过滤 isActive !== false（缺失字段视为 active）
 *  - 4 列响应式 grid、空守卫返回 null
 *  - 视觉属性：tracking-widest + text-blue-400 + bg-zinc-900 + priority
 *  - 链接 href 指向 /agent/store/<id>
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, waitFor, screen } from "@testing-library/react";
import { createElement } from "react";

const listStoresMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/store-query", () => ({
  listStores: listStoresMock,
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const {
      src,
      alt,
      fill,
      sizes,
      placeholder,
      blurDataURL,
      priority,
      className,
    } = props;
    return (
      <img
        data-testid="next-image"
        data-src={String(src ?? "")}
        data-alt={String(alt ?? "")}
        data-fill={fill ? "true" : "false"}
        data-sizes={String(sizes ?? "")}
        data-placeholder={String(placeholder ?? "")}
        data-blur={String(blurDataURL ?? "")}
        data-priority={priority ? "true" : "false"}
        className={String(className ?? "")}
      />
    );
  },
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: Record<string, unknown>) => (
    <a href={String(href ?? "")} {...rest}>
      {children as React.ReactNode}
    </a>
  ),
}));

import { FeaturedStores } from "./FeaturedStores";

/**
 * 渲染 RSC：await 出 Promise，然后包装进 Fragment 渲染。
 * happy-dom + Testing Library 不直接支持 async RSC。
 */
async function renderRSC() {
  const resolved = await FeaturedStores();
  return render(createElement("div", null, resolved));
}

function createStore(overrides: Record<string, unknown> = {}) {
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
    image: "/images/stores/100001.webp",
    isActive: true,
    ...overrides,
  };
}

describe("FeaturedStores", () => {
  beforeEach(() => {
    listStoresMock.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("R1: 调用 getStores({ level: flagship, limit: 4 })", async () => {
    listStoresMock.mockReturnValue([]);
    await renderRSC();
    await waitFor(() => expect(listStoresMock).toHaveBeenCalledTimes(1));
    expect(listStoresMock).toHaveBeenCalledWith({
      level: "flagship",
      limit: 4,
    });
  });

  it("R2: 渲染标题「推荐门店」与英文 eyebrow FEATURED STORES", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "100001" }),
      createStore({ id: "100002" }),
    ]);
    await renderRSC();
    expect(await screen.findByText("推荐门店")).toBeInTheDocument();
    expect(screen.getByText("FEATURED STORES")).toBeInTheDocument();
  });

  it("R2a: 渲染副标题「精选星辉旗舰店」", async () => {
    listStoresMock.mockReturnValue([createStore({ id: "100001" })]);
    await renderRSC();
    expect(
      await screen.findByText(/精选星辉旗舰店/),
    ).toBeInTheDocument();
  });

  it("R3: eyebrow 使用 tracking-widest + text-blue-400", async () => {
    listStoresMock.mockReturnValue([createStore({ id: "100001" })]);
    await renderRSC();
    const eyebrow = await screen.findByText("FEATURED STORES");
    expect(eyebrow.className).toContain("tracking-widest");
    expect(eyebrow.className).toContain("text-blue-400");
  });

  it("R4: grid 容器包含 4 列响应式 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4", async () => {
    listStoresMock.mockReturnValue([createStore({ id: "100001" })]);
    const { container } = await renderRSC();
    await screen.findByText("推荐门店");
    const grid = container.querySelector("div.grid");
    expect(grid?.className ?? "").toMatch(/grid-cols-1/);
    expect(grid?.className ?? "").toMatch(/sm:grid-cols-2/);
    expect(grid?.className ?? "").toMatch(/lg:grid-cols-4/);
  });

  it("R5: 每个卡片背景 bg-zinc-900 + border-zinc-800", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "100001", name: "门店A" }),
      createStore({ id: "100002", name: "门店B" }),
    ]);
    const { container } = await renderRSC();
    await screen.findByText("门店A");
    const cards = container.querySelectorAll("a.group");
    expect(cards.length).toBeGreaterThanOrEqual(1);
    const cardClass = cards[0].className;
    expect(cardClass).toContain("bg-zinc-900");
    expect(cardClass).toContain("border-zinc-800");
  });

  it("R6: Next/Image 渲染携带 priority=false（非首屏不抢占带宽）+ placeholder=blur + sizes + fill", async () => {
    listStoresMock.mockReturnValue([createStore({ id: "100001" })]);
    await renderRSC();
    const imgs = await screen.findAllByTestId("next-image");
    expect(imgs.length).toBeGreaterThan(0);
    const img = imgs[0];
    expect(img.getAttribute("data-priority")).toBe("false");
    expect(img.getAttribute("data-placeholder")).toBe("blur");
    expect(img.getAttribute("data-fill")).toBe("true");
    expect(img.getAttribute("data-sizes")).toContain("100vw");
  });

  it("R7: 每张图 src 使用 store.image（fallback 到 placeholder）", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "100001", image: "/uploads/store-A.webp" }),
      createStore({ id: "100002", image: undefined, name: "无图门店" }),
    ]);
    await renderRSC();
    const imgs = await screen.findAllByTestId("next-image");
    const srcs = imgs.map((i) => i.getAttribute("data-src"));
    expect(srcs).toContain("/uploads/store-A.webp");
    expect(srcs).toContain("/images/placeholders/store.webp");
  });

  it("R8: 卡片 Link 的 href 指向 /agent/store/<id>", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "100001" }),
      createStore({ id: "100002" }),
    ]);
    const { container } = await renderRSC();
    await screen.findByText("推荐门店");
    const links = container.querySelectorAll("a[href^='/agent/store/']");
    const hrefs = Array.from(links).map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/agent/store/100001");
    expect(hrefs).toContain("/agent/store/100002");
  });

  it("R9: 过滤 isActive=false 的门店，缺失字段视为 active", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "A-keep", isActive: true }),
      createStore({ id: "B-hidden", isActive: false }),
      createStore({ id: "C-default", isActive: undefined }),
    ]);
    const { container } = await renderRSC();
    await waitFor(() =>
      expect(
        container.querySelectorAll("a[href^='/agent/store/']").length,
      ).toBe(2),
    );
    const hrefs = Array.from(
      container.querySelectorAll("a[href^='/agent/store/']"),
    ).map((l) => l.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining([
        "/agent/store/A-keep",
        "/agent/store/C-default",
      ]),
    );
    expect(hrefs).not.toContain("/agent/store/B-hidden");
  });

  it("R10: 空数组 → 整个 section 不渲染（返回 null）", async () => {
    listStoresMock.mockReturnValue([]);
    const { container } = await renderRSC();
    await waitFor(() => expect(listStoresMock).toHaveBeenCalled());
    expect(container.querySelector("section")).toBeNull();
    expect(screen.queryByText("推荐门店")).toBeNull();
    expect(screen.queryByText("FEATURED STORES")).toBeNull();
  });

  it("R11: 全 inactive 过滤后为空 → 整个 section 不渲染", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "x1", isActive: false }),
      createStore({ id: "x2", isActive: false }),
    ]);
    const { container } = await renderRSC();
    await waitFor(() => expect(listStoresMock).toHaveBeenCalled());
    expect(container.querySelector("section")).toBeNull();
  });

  it("R12: 渲染的城市标签来自 store.cityLabel", async () => {
    listStoresMock.mockReturnValue([
      createStore({ id: "100001", cityLabel: "佛山市" }),
      createStore({ id: "100002", cityLabel: "杭州市" }),
    ]);
    await renderRSC();
    await waitFor(() => {
      expect(screen.getAllByText("佛山市").length).toBeGreaterThan(0);
      expect(screen.getAllByText("杭州市").length).toBeGreaterThan(0);
    });
  });
});
