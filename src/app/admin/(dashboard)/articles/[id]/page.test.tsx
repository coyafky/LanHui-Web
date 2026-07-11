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

vi.mock("@/lib/admin-csrf-fetch", () => ({
  adminCsrfFetch: (...args: unknown[]) => fetchMock(...args),
}));

import { EditArticleClient } from "./EditArticleClient";
import type { ArticleStatus } from "@/lib/validations/article";

const INITIAL_ARTICLE = {
  title: "测试文章标题",
  slug: "test-article-title",
  excerpt: "这是一篇测试文章",
  content: "## 文章内容\n\n正文内容。",
  category: "新闻",
  tags: ["测试", "新闻"],
  status: "draft" as ArticleStatus,
  isSticky: false,
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
  ARTICLE_PUT: "/api/articles/article-1",
};

function getMethod(_url: string, options?: { method?: string }): string {
  if (!options) return "GET";
  return options.method || "GET";
}

function renderEditClient() {
  render(<EditArticleClient initialArticle={INITIAL_ARTICLE} id="article-1" />);
}

describe("EditArticleClient", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    routerPush.mockReset();
    global.fetch = fetchMock;

    fetchMock.mockImplementation(
      (url: string, options?: { method?: string }) => {
        const method = getMethod(url, options);
        if (url === API.CATEGORIES) {
          return Promise.resolve(categoriesResponse());
        }
        if (url === API.ARTICLE_PUT && method === "PUT") {
          return Promise.resolve(putSuccessResponse());
        }
        return Promise.resolve(putSuccessResponse());
      },
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('renders ArticleForm with mode="edit" with pre-filled data', () => {
    renderEditClient();

    expect(screen.getByText("编辑文章")).toBeInTheDocument();
    expect(screen.getByDisplayValue("测试文章标题")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test-article-title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("输入文章内容（支持 Markdown）"),
    ).toBeInTheDocument();
  });

  it("client-side validation prevents API PUT when required fields cleared", async () => {
    renderEditClient();

    const titleInput = screen.getByDisplayValue("测试文章标题");
    fireEvent.change(titleInput, { target: { value: "" } });

    const contentInput = screen.getByPlaceholderText(
      "输入文章内容（支持 Markdown）",
    );
    fireEvent.change(contentInput, { target: { value: "" } });

    const button = screen.getByText("保存");
    const form = button.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("标题不能为空")).toBeInTheDocument();
    });
    expect(screen.getByText("内容不能为空")).toBeInTheDocument();

    const putCalls = fetchMock.mock.calls.filter(
      (call: unknown[]) =>
        call[0] === API.ARTICLE_PUT && (call[1] as { method?: string })?.method === "PUT",
    );
    expect(putCalls).toHaveLength(0);
  });

  it("submits successfully and navigates to /admin/articles", async () => {
    renderEditClient();

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
        if (url === API.ARTICLE_PUT && method === "PUT") {
          return Promise.resolve(
            putErrorResponse({ title: "标题已存在" }),
          );
        }
        return Promise.resolve(putSuccessResponse());
      },
    );

    renderEditClient();

    const titleInput = screen.getByDisplayValue("测试文章标题");
    fireEvent.change(titleInput, { target: { value: "重复标题" } });

    const button = screen.getByText("保存");
    const form = button.closest("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(screen.getByText("标题已存在")).toBeInTheDocument();
    });
  });
});
