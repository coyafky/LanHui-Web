import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/link
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock EntityImageUploader to isolate tests
vi.mock("@/components/admin/EntityImageUploader", () => ({
  EntityImageUploader: ({
    entity,
    entityId,
    currentPath,
  }: Record<string, unknown>) => (
    <div data-testid="entity-image-uploader">
      <span data-testid="uploader-entity">{String(entity)}</span>
      <span data-testid="uploader-entity-id">{String(entityId)}</span>
      <span data-testid="uploader-current-path">
        {currentPath == null ? "null" : String(currentPath)}
      </span>
    </div>
  ),
}));

import { EntityImagePage, type EntityImagePageConfig } from "./EntityImagePage";

/* ── Test helpers ── */

function createArticleConfig(
  overrides: Partial<EntityImagePageConfig> = {}
): EntityImagePageConfig {
  return {
    entity: "article",
    entityId: "article-1",
    fetchEndpoint: "/api/articles/article-1",
    backHref: "/admin/articles",
    crumbLabel: "文章封面图",
    title: "文章封面图管理",
    storageHint: "图片将以 webp 格式保存到 public/images/articles/。",
    selectData: (json: unknown) => {
      const d = (json as Record<string, unknown>).data as Record<
        string,
        unknown
      >;
      return {
        id: String(d.id),
        name: String(d.title),
        imagePath: (d.featuredImage as string | null) ?? null,
      };
    },
    ...overrides,
  };
}

function createStoreConfig(
  overrides: Partial<EntityImagePageConfig> = {}
): EntityImagePageConfig {
  return {
    entity: "store",
    entityId: "store-1",
    fetchEndpoint: "/api/stores/store-1",
    backHref: "/admin/stores",
    crumbLabel: "门店主图",
    title: "门店主图管理",
    storageHint: "图片将以 webp 格式保存到 public/images/stores/。",
    selectData: (json: unknown) => {
      const d = (json as Record<string, unknown>).data as Record<
        string,
        unknown
      >;
      return {
        id: String(d.id),
        name: String(d.name),
        imagePath: (d.imagePath as string | null) ?? null,
      };
    },
    ...overrides,
  };
}

/* ── Tests ── */

describe("EntityImagePage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  /* ------------------------------------------------------------------ */
  /*  Loading state                                                      */
  /* ------------------------------------------------------------------ */

  it("shows loading spinner while fetching", () => {
    global.fetch = vi
      .fn()
      .mockImplementation(() => new Promise(() => {}));

    render(<EntityImagePage config={createArticleConfig()} />);

    expect(
      screen.getByTestId("entity-image-page-loading")
    ).toBeInTheDocument();
  });

  /* ------------------------------------------------------------------ */
  /*  Error state                                                        */
  /* ------------------------------------------------------------------ */

  it("shows error message and retry button on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("网络错误"));

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("网络错误")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "重试" })
    ).toBeInTheDocument();
  });

  it("refetches data when retry button is clicked", async () => {
    const user = userEvent.setup();

    // First fetch fails
    global.fetch = vi.fn().mockRejectedValue(new Error("网络错误"));

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("网络错误")).toBeInTheDocument();
    });

    // Second fetch succeeds
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "article-1", title: "文章标题", featuredImage: null },
        }),
    });

    await user.click(screen.getByRole("button", { name: "重试" }));

    await waitFor(() => {
      expect(screen.getByText("文章标题")).toBeInTheDocument();
    });
  });

  /* ------------------------------------------------------------------ */
  /*  Article config                                                     */
  /* ------------------------------------------------------------------ */

  it("renders article config with title and featuredImage", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            id: "article-1",
            title: "文章标题",
            featuredImage: "/images/articles/test.webp",
          },
        }),
    });

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("文章标题")).toBeInTheDocument();
    });

    expect(screen.getByText("文章封面图管理")).toBeInTheDocument();
    expect(screen.getByText("文章封面图")).toBeInTheDocument();

    expect(screen.getByTestId("uploader-entity").textContent).toBe("article");
    expect(screen.getByTestId("uploader-entity-id").textContent).toBe(
      "article-1"
    );
    expect(screen.getByTestId("uploader-current-path").textContent).toBe(
      "/images/articles/test.webp"
    );
  });

  it("renders article config with null featuredImage", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "article-1", title: "文章标题", featuredImage: null },
        }),
    });

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("文章标题")).toBeInTheDocument();
    });

    expect(screen.getByTestId("uploader-current-path").textContent).toBe(
      "null"
    );
  });

  /* ------------------------------------------------------------------ */
  /*  Store config                                                       */
  /* ------------------------------------------------------------------ */

  it("renders store config with name and imagePath", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            id: "store-1",
            name: "测试门店",
            imagePath: "/images/stores/store.webp",
          },
        }),
    });

    render(<EntityImagePage config={createStoreConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("测试门店")).toBeInTheDocument();
    });

    expect(screen.getByText("门店主图管理")).toBeInTheDocument();
    expect(screen.getByText("门店主图")).toBeInTheDocument();

    expect(screen.getByTestId("uploader-entity").textContent).toBe("store");
    expect(screen.getByTestId("uploader-entity-id").textContent).toBe(
      "store-1"
    );
    expect(screen.getByTestId("uploader-current-path").textContent).toBe(
      "/images/stores/store.webp"
    );
  });

  it("renders store config with null imagePath", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "store-1", name: "测试门店", imagePath: null },
        }),
    });

    render(<EntityImagePage config={createStoreConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("测试门店")).toBeInTheDocument();
    });

    expect(screen.getByTestId("uploader-current-path").textContent).toBe(
      "null"
    );
  });

  /* ------------------------------------------------------------------ */
  /*  Back link                                                          */
  /* ------------------------------------------------------------------ */

  it("renders back link with correct href", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "article-1", title: "文章标题", featuredImage: null },
        }),
    });

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(screen.getByText("返回列表")).toBeInTheDocument();
    });

    const backLink = screen.getByText("返回列表").closest("a");
    expect(backLink).toHaveAttribute("href", "/admin/articles");
  });

  /* ------------------------------------------------------------------ */
  /*  Storage hint                                                       */
  /* ------------------------------------------------------------------ */

  it("renders storage hint text", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { id: "article-1", title: "文章标题", featuredImage: null },
        }),
    });

    render(<EntityImagePage config={createArticleConfig()} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "图片将以 webp 格式保存到 public/images/articles/。"
        )
      ).toBeInTheDocument();
    });
  });
});
