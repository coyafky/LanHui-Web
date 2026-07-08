import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";

const fetchMock = vi.hoisted(() => vi.fn());
const routerPush = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, refresh: vi.fn(), replace: vi.fn() }),
  useParams: () => ({ id: "article-1" }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import EditArticlePage from "./page";

const MOCK_ARTICLE = {
  id: "article-1",
  title: "测试文章标题",
  slug: "test-article-title",
  excerpt: "这是一篇测试文章",
  content: "## 文章内容\n\n正文内容。",
  category: "新闻",
  tags: ["测试", "新闻"],
  status: "draft",
  isSticky: false,
  publishedAt: null,
};

function mockResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

function categoriesResponse() {
  return mockResponse({
    success: true,
    data: {
      categories: [
        { value: "新闻", label: "新闻" },
        { value: "行业动态", label: "行业动态" },
      ],
    },
  });
}

function articleResponse(overrides?: Partial<typeof MOCK_ARTICLE>) {
  return mockResponse({
    success: true,
    data: { ...MOCK_ARTICLE, ...overrides },
  });
}

function putSuccessResponse() {
  return mockResponse({ success: true, data: { id: "article-1" } });
}

function putErrorResponse(fieldErrors?: Record<string, string>) {
  return mockResponse(
    {
      success: false,
      error: "Validation failed",
      details: fieldErrors ? { fieldErrors } : undefined,
    },
    400,
  );
}

const API = {
  CATEGORIES: "/api/articles/categories",
  ARTICLE_GET: "/api/articles/article-1",
  ARTICLE_PUT: "/api/articles/article-1",
};

/**
 * Helper: get HTTP method from fetch options.
 * global.fetch(url, options) — options.method is "GET" by default.
 */
function getMethod(url: string, options?: { method?: string }): string {
  // The categories fetch has no second arg = GET.
  // The article GET also has no second arg = GET.
  // The article PUT has { method: "PUT", ... }.
  if (!options) return "GET";
  return options.method || "GET";
}

async function renderAndWaitForForm() {
  render(<EditArticlePage />);
  await waitFor(() => {
    expect(screen.getByPlaceholderText("输入文章标题")).toBeInTheDocument();
  });
}

describe("EditArticlePage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    routerPush.mockReset();

    // Default: categories GET ✓, article GET ✓, PUT ✓
    fetchMock.mockImplementation(
      (url: string, options?: { method?: string }) => {
        const method = getMethod(url, options);
        if (url === API.CATEGORIES) {
          return Promise.resolve(categoriesResponse());
        }
        if (url === API.ARTICLE_GET && method === "GET") {
          return Promise.resolve(articleResponse());
        }
        if (url === API.ARTICLE_PUT && method === "PUT") {
          return Promise.resolve(putSuccessResponse());
        }
        return Promise.resolve(putSuccessResponse());
      },
    );
    global.fetch = fetchMock;
  });

  afterEach(() => {
    cleanup();
  });

  it('shows "加载中..." initially', () => {
    // Never resolve any fetch — component stays in loading state
    fetchMock.mockImplementation(() => new Promise(() => {}));

    render(<EditArticlePage />);

    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it('renders ArticleForm with mode="edit" after article loads', async () => {
    await renderAndWaitForForm();

    expect(screen.getByText("编辑文章")).toBeInTheDocument();
    expect(screen.getByDisplayValue("测试文章标题")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test-article-title")).toBeInTheDocument();
    // Content textarea has multiline value — verify by placeholder + existence
    expect(
      screen.getByPlaceholderText("输入文章内容（支持 Markdown）"),
    ).toBeInTheDocument();
  });

  it("displays error when article is not found", async () => {
    fetchMock.mockImplementation(
      (url: string, options?: { method?: string }) => {
        if (url === API.CATEGORIES) {
          return Promise.resolve(categoriesResponse());
        }
        // GET article returns not found
        return Promise.resolve(mockResponse({ success: false }, 404));
      },
    );

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByText("文章不存在")).toBeInTheDocument();
    });
  });

  it('displays "加载失败" on network error', async () => {
    fetchMock.mockImplementation(
      (url: string, options?: { method?: string }) => {
        if (url === API.CATEGORIES) {
          return Promise.resolve(categoriesResponse());
        }
        return Promise.reject(new Error("Network error"));
      },
    );

    render(<EditArticlePage />);

    await waitFor(() => {
      expect(screen.getByText("加载失败")).toBeInTheDocument();
    });
  });

  it("client-side validation prevents API PUT when required fields cleared", async () => {
    await renderAndWaitForForm();

    // Clear title and content
    const titleInput = screen.getByDisplayValue("测试文章标题");
    fireEvent.change(titleInput, { target: { value: "" } });

    // Clear content — find textarea by placeholder
    const contentInput = screen.getByPlaceholderText(
      "输入文章内容（支持 Markdown）",
    );
    fireEvent.change(contentInput, { target: { value: "" } });

    // Submit form
    const button = screen.getByText("保存");
    const form = button.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("标题不能为空")).toBeInTheDocument();
    });
    expect(screen.getByText("内容不能为空")).toBeInTheDocument();

    // Verify PUT was never called
    const putCalls = fetchMock.mock.calls.filter(
      (call: unknown[]) =>
        call[0] === API.ARTICLE_PUT && call[1]?.method === "PUT",
    );
    expect(putCalls).toHaveLength(0);
  });

  it("submits successfully and navigates to /admin/articles", async () => {
    await renderAndWaitForForm();

    // Submit form with existing data (no changes needed)
    const button = screen.getByText("保存");
    const form = button.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/admin/articles");
    });
  });

  it("maps server fieldErrors to form when API returns validation error", async () => {
    fetchMock.mockImplementation(
      (url: string, options?: { method?: string }) => {
        const method = getMethod(url, options);
        if (url === API.CATEGORIES) {
          return Promise.resolve(categoriesResponse());
        }
        if (url === API.ARTICLE_GET && method === "GET") {
          return Promise.resolve(articleResponse());
        }
        if (url === API.ARTICLE_PUT && method === "PUT") {
          return Promise.resolve(
            putErrorResponse({ title: "标题已存在" }),
          );
        }
        return Promise.resolve(putSuccessResponse());
      },
    );

    await renderAndWaitForForm();

    // Modify title
    const titleInput = screen.getByDisplayValue("测试文章标题");
    fireEvent.change(titleInput, { target: { value: "重复标题" } });

    // Submit form
    const button = screen.getByText("保存");
    const form = button.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("标题已存在")).toBeInTheDocument();
    });
  });
});
